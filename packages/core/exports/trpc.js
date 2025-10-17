/**
 * @template TRouter
 * @typedef {import('@trpc/client').CreateTRPCProxyClient<TRouter>} TRPCClient
 */

/**
 * tRPC client instance - initialized by framework
 * @type {any}
 */
export let trpc;

/**
 * Initialize tRPC client (called by framework)
 * @param {any} client - tRPC client instance
 */
export function _initTrpc(client) {
  trpc = client;
}
