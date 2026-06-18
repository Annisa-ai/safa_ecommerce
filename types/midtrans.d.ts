export {}

declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks: any) => void
      embed?: any
      show?: any
      hide?: any
      init?: any
    }
  }
}