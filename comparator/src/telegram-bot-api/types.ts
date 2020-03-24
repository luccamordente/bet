/**
 * This object represents a Telegram user or bot.
 */
export interface User {
  /** Unique identifier for this user or bot */
  id: number;
  /** True, if this user is a bot */
  is_bot: boolean;
  /** User‘s or bot’s first name */
  first_name: string;
  /** User‘s or bot’s last name */
  last_name?: string;
  /** User‘s or bot’s username */
  username?: string;
  /** IETF language tag of the user's language */
  language_code?: string;
  /** True, if the bot can be invited to groups. Returned only in getMe. */
  can_join_groups?: boolean;
  /** True, if privacy mode is disabled for the bot. Returned only in getMe. */
  can_read_all_group_messages?: boolean;
  /** True, if the bot supports inline queries. Returned only in getMe. */
  supports_inline_queries?: boolean;
}

/**
 * This object represents a chat.
 */
export interface Chat {
  /** Unique identifier for this chat. This number may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it. But it is smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier. */
  readonly id: number;
  /** Type of chat, can be either “private”, “group”, “supergroup” or “channel” */
  readonly type: string;
  /** Optional. Title, for supergroups, channels and group chats */
  readonly title?: string;
  /** Optional. Username, for private chats, supergroups and channels if available */
  readonly username?: string;
  /** Optional. First name of the other party in a private chat */
  readonly first_name?: string;
  /** Optional. Last name of the other party in a private chat */
  readonly last_name?: string;
  /** Optional. Chat photo. Returned only in getChat. */
  readonly photo?: ChatPhoto;
  /** Optional. Description, for groups, supergroups and channel chats. Returned only in getChat. */
  readonly description?: string;
  /** Optional. Chat invite link, for groups, supergroups and channel chats. Each administrator in a chat generates their own invite links, so the bot must first generate the link using exportChatInviteLink. Returned only in getChat. */
  readonly invite_link?: string;
  /** Optional. Pinned message, for groups, supergroups and channels. Returned only in getChat. */
  readonly pinned_message?: Message;
  /** Optional. Default chat member permissions, for groups and supergroups. Returned only in getChat. */
  readonly permissions?: ChatPermissions;
  /** Optional. For supergroups, the minimum allowed delay between consecutive messages sent by each unpriviledged user. Returned only in getChat. */
  readonly slow_mode_delay?: number;
  /** Optional. For supergroups, name of group sticker set. Returned only in getChat. */
  readonly sticker_set_name?: string;
  /** Optional. True, if the bot can change the group sticker set. Returned only in getChat. */
  readonly can_set_sticker_set?: boolean;
}

/**
 * This object represents a message.
 */
export interface Message {
  /** Unique message identifier inside this chat */
  readonly message_id: number;
  /** Sender, empty for messages sent to channels */
  readonly from?: User;
  /** Date the message was sent in Unix time */
  readonly date: number;
  /** Conversation the message belongs to */
  readonly chat: Chat;
  /** For forwarded messages, sender of the original message */
  readonly forward_from?: User;
  /** For messages forwarded from channels, information about the original channel */
  readonly forward_from_chat?: Chat;
  /** For messages forwarded from channels, identifier of the original message in the channel */
  readonly forward_from_message_id?: number;
  /** For messages forwarded from channels, signature of the post author if present */
  readonly forward_signature?: string;
  /** Sender's name for messages forwarded from users who disallow adding a link to their account in forwarded messages */
  readonly forward_sender_name?: string;
  /** For forwarded messages, date the original message was sent in Unix time */
  readonly forward_date?: number;
  /** For replies, the original message. Note that the Message object in this field will not contain further reply_to_message fields even if it itself is a reply. */
  readonly reply_to_message?: Message;
  /** Date the message was last edited in Unix time */
  readonly edit_date?: number;
  /** The unique identifier of a media message group this message belongs to */
  readonly media_group_id?: string;
  /** Signature of the post author for messages in channels */
  readonly author_signature?: string;
  /** For text messages, the actual UTF-8 text of the message, 0-4096 characters */
  readonly text?: string;
  /** For text messages, special entities like usernames, URLs, bot commands, etc. that appear in the text */
  readonly entities?: readonly MessageEntity[];
  /** For messages with a caption, special entities like usernames, URLs, bot commands, etc. that appear in the caption */
  readonly caption_entities?: readonly MessageEntity[];
  /** Message is an audio file, information about the file */
  readonly audio?: Audio;
  /** Message is a general file, information about the file */
  readonly document?: Document;
  /** Message is an animation, information about the animation. For backward compatibility, when this field is set, the document field will also be set */
  readonly animation?: Animation;
  /** Message is a game, information about the game. More about games » */
  readonly game?: Game;
  /** Message is a photo, available sizes of the photo */
  readonly photo?: readonly PhotoSize[];
  /** Message is a sticker, information about the sticker */
  readonly sticker?: Sticker;
  /** Message is a video, information about the video */
  readonly video?: Video;
  /** Message is a voice message, information about the file */
  readonly voice?: Voice;
  /** Message is a video note, information about the video message */
  readonly video_note?: VideoNote;
  /** Caption for the animation, audio, document, photo, video or voice, 0-1024 characters */
  readonly caption?: string;
  /** Message is a shared contact, information about the contact */
  readonly contact?: Contact;
  /** Message is a shared location, information about the location */
  readonly location?: Location;
  /** Message is a venue, information about the venue */
  readonly venue?: Venue;
  /** Message is a native poll, information about the poll */
  readonly poll?: Poll;
  /** New members that were added to the group or supergroup and information about them (the bot itself may be one of these members) */
  readonly new_chat_members?: readonly User[];
  /** A member was removed from the group, information about them (this member may be the bot itself) */
  readonly left_chat_member?: User;
  /** A chat title was changed to this value */
  readonly new_chat_title?: string;
  /** A chat photo was change to this value */
  readonly new_chat_photo?: readonly PhotoSize[];
  /** Service message: the chat photo was deleted */
  readonly delete_chat_photo?: true;
  /** Service message: the group has been created */
  readonly group_chat_created?: true;
  /** Service message: the supergroup has been created. This field can‘t be received in a message coming through updates, because bot can’t be a member of a supergroup when it is created. It can only be found in reply_to_message if someone replies to a very first message in a directly created supergroup. */
  readonly supergroup_chat_created?: true;
  /** Service message: the channel has been created. This field can‘t be received in a message coming through updates, because bot can’t be a member of a channel when it is created. It can only be found in reply_to_message if someone replies to a very first message in a channel. */
  readonly channel_chat_created?: true;
  /** The group has been migrated to a supergroup with the specified identifier. This number may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it. But it is smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier. */
  readonly migrate_to_chat_id?: number;
  /** The supergroup has been migrated from a group with the specified identifier. This number may be greater than 32 bits and some programming languages may have difficulty/silent defects in interpreting it. But it is smaller than 52 bits, so a signed 64 bit integer or double-precision float type are safe for storing this identifier. */
  readonly migrate_from_chat_id?: number;
  /** Specified message was pinned. Note that the Message object in this field will not contain further reply_to_message fields even if it is itself a reply. */
  readonly pinned_message?: Message;
  /** Message is an invoice for a payment, information about the invoice. More about payments » */
  readonly invoice?: Invoice;
  /** Message is a service message about a successful payment, information about the payment. More about payments » */
  readonly successful_payment?: SuccessfulPayment;
  /** The domain name of the website on which the user has logged in. More about Telegram Login » */
  readonly connected_website?: string;
  /** Telegram Passport data */
  readonly passport_data?: PassportData;
  /** Inline keyboard attached to the message. login_url buttons are represented as ordinary url buttons. */
  readonly reply_markup?: InlineKeyboardMarkup;
}

/** WIP */
export type ChatPhoto = never;

/** WIP */
export type ChatPermissions = never;

/** WIP */
export type MessageEntity = never;

/** WIP */
export type Audio = never;

/** WIP */
export type Document = never;

/** WIP */
export type Animation = never;

/** WIP */
export type Game = never;

/** WIP */
export type PhotoSize = never;

/** WIP */
export type Sticker = never;

/** WIP */
export type Video = never;

/** WIP */
export type Voice = never;

/** WIP */
export type VideoNote = never;

/** WIP */
export type Contact = never;

/** WIP */
export type Location = never;

/** WIP */
export type Venue = never;

/** WIP */
export type Poll = never;

/** WIP */
export type Invoice = never;

/** WIP */
export type SuccessfulPayment = never;

/** WIP */
export type PassportData = never;

/** WIP */
export type InlineKeyboardMarkup = never;

/** WIP */
export type ReplyKeyboardMarkup = never;

/** WIP */
export type ReplyKeyboardRemove = never;

/** WIP */
export type ForceReply = never;
