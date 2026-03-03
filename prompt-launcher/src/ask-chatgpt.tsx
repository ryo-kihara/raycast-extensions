import {
  Action,
  ActionPanel,
  closeMainWindow,
  getDefaultApplication,
  getPreferenceValues,
  Icon,
  List,
  LocalStorage,
  open,
  useNavigation,
  Form,
} from "@raycast/api";
import { useEffect, useState } from "react";

interface Preferences {
  translateSuffix: string;
  branchNameSuffix: string;
  prTitleSuffix: string;
}

interface Snippet {
  id: string;
  title: string;
  suffix: string;
}

const SNIPPETS_KEY = "custom-snippets";

async function loadSnippets(): Promise<Snippet[]> {
  const json = await LocalStorage.getItem<string>(SNIPPETS_KEY);
  return json ? JSON.parse(json) : [];
}

async function saveSnippets(snippets: Snippet[]) {
  await LocalStorage.setItem(SNIPPETS_KEY, JSON.stringify(snippets));
}

function buildChatGPTUrl(message: string, suffix: string): string {
  const url = new URL("https://chatgpt.com/");
  url.searchParams.set("q", message + " " + suffix);
  return url.toString();
}

async function openChatGPT(message: string, suffix: string) {
  const url = buildChatGPTUrl(message, suffix);
  const browser = await getDefaultApplication("https://www.example.com");
  await open(url, browser);
  await closeMainWindow();
}

const defaultItems = [
  { title: "ブランチ名", icon: Icon.Code, suffixKey: "branchNameSuffix" as const },
  { title: "PRタイトル", icon: Icon.Document, suffixKey: "prTitleSuffix" as const },
  { title: "翻訳", icon: Icon.Globe, suffixKey: "translateSuffix" as const },
];

function CreateSnippetForm({ onCreate }: { onCreate: (snippet: Snippet) => void }) {
  const { pop } = useNavigation();

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Snippet"
            onSubmit={(values: { title: string; suffix: string }) => {
              const snippet: Snippet = {
                id: Date.now().toString(),
                title: values.title,
                suffix: values.suffix,
              };
              onCreate(snippet);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" placeholder="スニペット名" />
      <Form.TextArea id="suffix" title="Suffix" placeholder="ChatGPT に追加するサフィックス" />
    </Form>
  );
}

export default function AskChatGPT() {
  const preferences = getPreferenceValues<Preferences>();
  const [searchText, setSearchText] = useState("");
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    loadSnippets().then(setSnippets);
  }, []);

  async function handleCreate(snippet: Snippet) {
    const updated = [...snippets, snippet];
    setSnippets(updated);
    await saveSnippets(updated);
  }

  async function handleDelete(id: string) {
    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    await saveSnippets(updated);
  }

  return (
    <List searchBarPlaceholder="メッセージを入力..." filtering={false} onSearchTextChange={setSearchText}>
      <List.Section title="Default">
        {defaultItems.map((item) => (
          <List.Item
            key={item.suffixKey}
            title={item.title}
            icon={item.icon}
            actions={
              <ActionPanel>
                <Action title={item.title} onAction={() => openChatGPT(searchText, preferences[item.suffixKey])} />
                <Action.Push
                  title="Create Snippet"
                  icon={Icon.Plus}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                  target={<CreateSnippetForm onCreate={handleCreate} />}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      {snippets.length > 0 && (
        <List.Section title="Custom">
          {snippets.map((snippet) => (
            <List.Item
              key={snippet.id}
              title={snippet.title}
              icon={Icon.Stars}
              accessories={[{ text: snippet.suffix, tooltip: snippet.suffix }]}
              actions={
                <ActionPanel>
                  <Action title={snippet.title} onAction={() => openChatGPT(searchText, snippet.suffix)} />
                  <Action.Push
                    title="Create Snippet"
                    icon={Icon.Plus}
                    shortcut={{ modifiers: ["cmd"], key: "n" }}
                    target={<CreateSnippetForm onCreate={handleCreate} />}
                  />
                  <Action
                    title="Delete Snippet"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    shortcut={{ modifiers: ["ctrl"], key: "x" }}
                    onAction={() => handleDelete(snippet.id)}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
