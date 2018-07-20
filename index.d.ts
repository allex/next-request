declare module 'next-request' {
  export class RequestQueue {
    push(src: string, params?: any, callback?: (err: Error | null, e: any) => any): void
  }
  export const nextRequest(src: string, params?: any, callback?: (err: Error | null, e: any) => any): void
}
