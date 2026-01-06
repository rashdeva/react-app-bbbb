import { useLocalRuntime } from '@assistant-ui/react';
import Anthropic from '@anthropic-ai/sdk';
import { useAppStore } from './store';
import {
  AI_TOOLS,
  executeGetWalletBalances,
  executeClassifyTokens,
  executeFindYieldStrategies,
  executeGetStrategyDetails,
  executePreviewDeposit,
  executeGetPositions,
} from './ai-tools';
import type { CoreMessage } from 'ai';

const SYSTEM_PROMPT = `You are a helpful and knowledgeable DeFi yield farming assistant. Your role is to help users understand yield farming, discover opportunities, and manage their positions.

Key guidelines:
- Be friendly and educational, especially for users new to DeFi
- Explain concepts clearly without being condescending
- When a wallet is connected, use the available tools to provide personalized recommendations
- Always mention risks when discussing strategies
- Use the preview_deposit tool before executing any deposits
- Format numbers clearly (e.g., "5.2% APY", "$1,234.56")
- When showing strategies, highlight the key differences (APY, risk level, protocol)

Remember:
- This is a demo/prototype with simulated transactions
- All transactions are on testnet (no real money)
- Tool calls help provide rich, interactive experiences

When wallet is NOT connected:
- Provide general educational content about yield farming
- Explain different strategies and protocols
- Encourage users to connect their wallet for personalized recommendations

When wallet IS connected:
- Use tools to read balances and suggest strategies based on their actual holdings
- Provide specific, actionable recommendations
- Guide users through deposit and withdrawal flows step by step`;

export function useAIClient(walletAddress: string | null) {
  const { mockBalances, positions, depositToStrategy, withdrawFromPosition } = useAppStore();

  const runtime = useLocalRuntime({
    initialMessages: [],
    maxSteps: 5,
    adapters: {
      // Use Anthropic SDK directly on client
      async *chatModel({ messages, abortSignal }) {
        // Get API key from environment
        const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

        if (!apiKey || apiKey === 'your-api-key-here') {
          yield {
            type: 'text-delta' as const,
            textDelta: 'Error: VITE_ANTHROPIC_API_KEY not configured. Please add it to your .env.local file.',
          };
          return;
        }

        const client = new Anthropic({
          apiKey,
          dangerouslyAllowBrowser: true, // Allow browser usage
        });

        // Convert messages to Anthropic format
        const anthropicMessages: Anthropic.MessageParam[] = messages
          .filter((m): m is CoreMessage & { role: 'user' | 'assistant' } =>
            m.role === 'user' || m.role === 'assistant'
          )
          .map((m) => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          }));

        // Build system prompt with wallet context
        let systemPrompt = SYSTEM_PROMPT;
        if (walletAddress) {
          systemPrompt += `\n\nWallet Status: CONNECTED
Connected Address: ${walletAddress}
Available Balances: ${JSON.stringify(mockBalances || [])}
Active Positions: ${positions?.length || 0} position(s)

Use the available tools to help this user manage their yield farming positions.`;
        } else {
          systemPrompt += `\n\nWallet Status: NOT CONNECTED
Provide general information and encourage the user to connect their wallet for personalized recommendations.`;
        }

        try {
          const stream = await client.messages.stream({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            system: systemPrompt,
            messages: anthropicMessages,
            tools: AI_TOOLS,
          });

          for await (const event of stream) {
            if (abortSignal?.aborted) {
              stream.abort();
              break;
            }

            if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                yield {
                  type: 'text-delta' as const,
                  textDelta: event.delta.text,
                };
              }
            }

            if (event.type === 'content_block_start') {
              if (event.content_block.type === 'tool_use') {
                const toolName = event.content_block.name;
                const toolCallId = event.content_block.id;

                // We'll collect the input in the next events
                yield {
                  type: 'tool-call' as const,
                  toolCallId,
                  toolName,
                  args: {},
                };
              }
            }

            if (event.type === 'message_stop') {
              // Handle tool calls
              const message = await stream.finalMessage();

              for (const block of message.content) {
                if (block.type === 'tool_use') {
                  const toolName = block.name;
                  const toolInput = block.input as Record<string, unknown>;

                  let result: unknown;

                  // Execute tool based on name
                  switch (toolName) {
                    case 'get_wallet_balances':
                      result = executeGetWalletBalances(mockBalances || []);
                      break;
                    case 'classify_tokens':
                      result = executeClassifyTokens(toolInput.tokens as string[] | undefined);
                      break;
                    case 'find_yield_strategies':
                      result = executeFindYieldStrategies(toolInput as Parameters<typeof executeFindYieldStrategies>[0]);
                      break;
                    case 'get_strategy_details':
                      result = executeGetStrategyDetails(toolInput.strategyId as string);
                      break;
                    case 'preview_deposit':
                      result = executePreviewDeposit(
                        toolInput.strategyId as string,
                        toolInput.amount as string,
                        toolInput.tokenSymbol as string
                      );
                      break;
                    case 'execute_deposit':
                      // This will be handled by client-side action
                      result = { success: false, error: 'Use client-side deposit action' };
                      break;
                    case 'get_positions':
                      result = executeGetPositions(positions || []);
                      break;
                    case 'withdraw_from_position':
                      // This will be handled by client-side action
                      result = { success: false, error: 'Use client-side withdraw action' };
                      break;
                    default:
                      result = { error: `Unknown tool: ${toolName}` };
                  }

                  yield {
                    type: 'tool-result' as const,
                    toolCallId: block.id,
                    result,
                  };
                }
              }
            }
          }
        } catch (error) {
          console.error('AI Error:', error);
          yield {
            type: 'text-delta' as const,
            textDelta: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      },
    },
  });

  return runtime;
}
