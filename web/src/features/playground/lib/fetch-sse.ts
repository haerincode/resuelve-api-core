/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

/**
 * Native fetch-based SSE implementation without timeout limits
 */
export class FetchSSE {
  private url: string
  private options: RequestInit
  private abortController: AbortController | null = null
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  private listeners: Map<string, Set<(event: MessageEvent) => void>> = new Map()
  public readyState: number = 0 // 0=CONNECTING, 1=OPEN, 2=CLOSED

  constructor(url: string, options: RequestInit & { payload?: string }) {
    this.url = url
    const { payload, ...fetchOptions } = options
    this.options = {
      ...fetchOptions,
      body: payload,
      signal: undefined, // Will set from abortController
    }
  }

  addEventListener(
    type: string,
    listener: (event: MessageEvent | Event) => void
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener as (event: MessageEvent) => void)
  }

  removeEventListener(
    type: string,
    listener: (event: MessageEvent | Event) => void
  ): void {
    this.listeners.get(type)?.delete(listener as (event: MessageEvent) => void)
  }

  private emit(type: string, data?: any): void {
    const listeners = this.listeners.get(type)
    if (!listeners) return

    const event = new MessageEvent(type, { data })
    // @ts-ignore - add readyState for compatibility
    event.readyState = this.readyState

    listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (e) {
        console.error(`SSE listener error (${type}):`, e)
      }
    })
  }

  async stream(): Promise<void> {
    this.abortController = new AbortController()
    this.readyState = 0 // CONNECTING

    try {
      const response = await fetch(this.url, {
        ...this.options,
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        this.readyState = 2 // CLOSED
        this.emit('error', await response.text())
        return
      }

      if (!response.body) {
        this.readyState = 2
        this.emit('error', 'No response body')
        return
      }

      this.readyState = 1 // OPEN
      this.emit('readystatechange')

      this.reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await this.reader.read()

        if (done) {
          this.readyState = 2
          this.emit('readystatechange')
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            this.emit('message', data)
          } else if (line.startsWith('event: ')) {
            // Handle custom events if needed
            const eventType = line.slice(7)
            this.emit(eventType)
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.readyState = 2
        this.emit('error', error.message || 'Stream error')
      }
    }
  }

  close(): void {
    this.abortController?.abort()
    this.reader?.cancel()
    this.reader = null
    this.readyState = 2
    this.emit('readystatechange')
  }
}
