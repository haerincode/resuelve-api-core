package relay

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/relay/helper"
	"github.com/QuantumNous/new-api/relaykit/dto"
	"github.com/QuantumNous/new-api/relaykit/types"
	"github.com/QuantumNous/new-api/service"

	"github.com/gin-gonic/gin"
)

func AudioHelper(c *gin.Context, info *relaycommon.RelayInfo) (newAPIError *types.NewAPIError) {
	info.InitChannelMeta(c)

	audioReq, ok := info.Request.(*dto.AudioRequest)
	if !ok {
		return types.NewError(errors.New("invalid request type"), types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
	}

	request, err := common.DeepCopy(audioReq)
	if err != nil {
		return types.NewError(fmt.Errorf("failed to copy request to AudioRequest: %w", err), types.ErrorCodeInvalidRequest, types.ErrOptionWithSkipRetry())
	}

	err = helper.ModelMappedHelper(c, info, request)
	if err != nil {
		return types.NewError(err, types.ErrorCodeChannelModelMappedError, types.ErrOptionWithSkipRetry())
	}

	adaptor := GetAdaptor(info.ApiType)
	if adaptor == nil {
		return types.NewError(fmt.Errorf("invalid api type: %d", info.ApiType), types.ErrorCodeInvalidApiType, types.ErrOptionWithSkipRetry())
	}
	adaptor.Init(info)

	ioReader, err := adaptor.ConvertAudioRequest(c, info, *request)
	if err != nil {
		return types.NewError(err, types.ErrorCodeConvertRequestFailed, types.ErrOptionWithSkipRetry())
	}

	resp, err := adaptor.DoRequest(c, info, ioReader)
	if err != nil {
		return types.NewOpenAIError(err, types.ErrorCodeDoRequestFailed, http.StatusInternalServerError)
	}
	statusCodeMappingStr := c.GetString("status_code_mapping")

	var httpResp *http.Response
	if resp != nil {
		httpResp = resp.(*http.Response)
		if httpResp.StatusCode != http.StatusOK {
			newAPIError = service.RelayErrorHandler(c.Request.Context(), httpResp, false)
			// reset status code 重置状态码
			service.ResetStatusCode(newAPIError, statusCodeMappingStr)
			return newAPIError
		}
	}

	usage, newAPIError := adaptor.DoResponse(c, httpResp, info)
	if newAPIError != nil {
		// reset status code 重置状态码
		service.ResetStatusCode(newAPIError, statusCodeMappingStr)
		return newAPIError
	}

	usageData := usage.(*dto.Usage)

	// Para streams: solo cobrar si terminó correctamente (done/eof/handler_stop).
	// Si el cliente se desconectó (client_gone) o hubo timeout/error, NO cobrar.
	if info.IsStream && info.StreamStatus != nil && !info.StreamStatus.IsNormalEnd() {
		logger.LogWarn(c, fmt.Sprintf("stream ended abnormally - reason:%s user:%d model:%s prompt_tokens:%d completion_tokens:%d",
			info.StreamStatus.EndReason, info.UserId, info.OriginModelName, usageData.PromptTokens, usageData.CompletionTokens))
		// Devolver el PreConsume
		if info.Billing != nil {
			info.Billing.Refund(c)
		}
		return nil
	}

	// Non-stream: validar que hay tokens consumidos (incluyendo TotalTokens para embeddings/etc)
	if !info.IsStream && usageData.PromptTokens == 0 && usageData.CompletionTokens == 0 && usageData.TotalTokens == 0 {
		logger.LogWarn(c, fmt.Sprintf("no tokens consumed in non-stream request - user:%d model:%s", info.UserId, info.OriginModelName))
		// Devolver el PreConsume
		if info.Billing != nil {
			info.Billing.Refund(c)
		}
		return nil
	}

	if usageData.CompletionTokenDetails.AudioTokens > 0 || usageData.PromptTokensDetails.AudioTokens > 0 {
		service.PostAudioConsumeQuota(c, info, usageData, "")
	} else {
		service.PostTextConsumeQuota(c, info, usageData, nil)
	}

	return nil
}
