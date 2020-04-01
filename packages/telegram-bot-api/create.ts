import { createGET, createGETEmpty, createPOST } from "./lib";
import * as types from "./types";

function getBaseURI(token: string) {
  return `https://api.telegram.org/bot${token}`;
}

function getURI(methodName: string, baseURI: string) {
  return `${baseURI}/${methodName}`;
}

export interface GetChatParams {
  /**
   * Unique identifier for the target chat or username of the target
   * supergroup or channel (in the format @channelusername).
   */
  readonly chat_id: string | number;
}

export interface SendMessageParams {
  /** Unique identifier for the target chat or username of the target channel (in the format @channelusername) */
  readonly chat_id: number | string;
  /** Text of the message to be sent, 1-4096 characters after entities parsing */
  readonly text: string;
  /** Send Markdown or HTML, if you want Telegram apps to show bold, italic, fixed-width text or inline URLs in your bot's message. */
  readonly parse_mode?: string;
  /** Disables link previews for links in this message */
  readonly disable_web_page_preview?: boolean;
  /** Sends the message silently. Users will receive a notification with no sound. */
  readonly disable_notification?: boolean;
  /** If the message is a reply, ID of the original message */
  readonly reply_to_message_id?: number;
  /** Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user. */
  readonly reply_markup?:
    | types.InlineKeyboardMarkup
    | types.ReplyKeyboardMarkup
    | types.ReplyKeyboardRemove
    | types.ForceReply;
}

export default function createTelegramBotAPI(token: string) {
  const baseURI = getBaseURI(token);

  return {
    /**
     * A simple method for testing your bot's auth token.
     * https://core.telegram.org/bots/api#getme
     */
    getMe: createGETEmpty<types.User>(getURI("getMe", baseURI)),

    /**
     * Use this method to get up to date information about the chat (current
     * name of the user for one-on-one conversations, current username of a
     * user, group or channel, etc.).
     * https://core.telegram.org/bots/api#getchat
     */
    getChat: createGET<types.Chat, GetChatParams>(getURI("getChat", baseURI)),

    /**
     * Use this method to send text messages.
     * https://core.telegram.org/bots/api#sendmessage
     */
    sendMessage: createPOST<types.Message, SendMessageParams>(
      getURI("sendMessage", baseURI),
    ),
  } as const;
}
