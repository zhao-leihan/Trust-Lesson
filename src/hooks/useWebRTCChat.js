"use client";

import { usePusherChat } from "./usePusherChat";

/**
 * useWebRTCChat Hook (Upgraded to Pusher Channels)
 * Seamless drop-in replacement maintaining full backwards compatibility.
 */
export function useWebRTCChat(props) {
  return usePusherChat(props);
}

export { usePusherChat };
