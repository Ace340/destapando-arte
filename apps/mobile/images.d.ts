// Static image assets resolve to Expo's asset registry module IDs at runtime
// (Metro), not to file URLs. `expo/types` doesn't declare them, so do it here.
declare module '*.png' {
  const asset: number
  export default asset
}
