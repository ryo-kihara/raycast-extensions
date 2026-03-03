/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Translate Suffix - Suffix appended when using the Translate action */
  "translateSuffix": string,
  /** Branch Name Suffix - Suffix appended when using the Branch Name action */
  "branchNameSuffix": string,
  /** PR Title Suffix - Suffix appended when using the PR Title action */
  "prTitleSuffix": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `ask-chatgpt` command */
  export type AskChatgpt = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `ask-chatgpt` command */
  export type AskChatgpt = {}
}

