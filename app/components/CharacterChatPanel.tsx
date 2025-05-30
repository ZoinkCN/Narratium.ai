"use client";

import { useEffect, useRef } from "react";
import ChatHtmlBubble from "@/app/components/ChatHtmlBubble";
import { CharacterAvatarBackground } from "@/app/components/CharacterAvatarBackground";
import { trackButtonClick, trackFormSubmit } from "@/app/lib/utils/google-analytics";

interface Character {
  id: string;
  name: string;
  personality?: string;
  avatar_path?: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp?: string;
}

interface Props {
  character: Character;
  messages: Message[];
  userInput: string;
  setUserInput: (val: string) => void;
  isSending: boolean;
  suggestedInputs: string[];
  onSubmit: (e: React.FormEvent) => void;
  onSuggestedInput: (input: string) => void;
  onTruncate: (id: string) => void;
  fontClass: string;
  serifFontClass: string;
  t: (key: string) => string;
  activeModes: Record<string, any>;
  setActiveModes: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export default function CharacterChatPanel({
  character,
  messages,
  userInput,
  setUserInput,
  isSending,
  suggestedInputs,
  onSubmit,
  onSuggestedInput,
  onTruncate,
  fontClass,
  serifFontClass,
  t,
  activeModes,
  setActiveModes,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };  

  useEffect(() => {
    const id = setTimeout(() => scrollToBottom(), 300);
    return () => clearTimeout(id);
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex-grow overflow-y-auto p-6 fantasy-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 opacity-60">
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="#f9c86d"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className={`text-[#c0a480] ${serifFontClass}`}>
                {t("characterChat.startConversation") || "Start a conversation..."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => {
                if (message.role === "sample") return null;

                return message.role === "user" ? (
                  <div key={index} className="flex justify-end mb-4">
                    <div className="whitespace-pre-line text-[#f4e8c1] story-text leading-relaxed magical-text">
                      <p
                        className={`${serifFontClass}`}
                        dangerouslySetInnerHTML={{
                          __html: (
                            message.content.match(/<input_message>([\s\S]*?)<\/input_message>/)?.[1] || ""
                          ).replace(
                            /^[\s\n\r]*((<[^>]+>\s*)*)?(玩家输入指令|Player Input)[:：]\s*/i,
                            "",
                          ),
                        }}
                      ></p>
                    </div>
                  </div>
                ) : (
                  <div key={index} className="mb-6">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        {character.avatar_path ? (
                          <CharacterAvatarBackground avatarPath={character.avatar_path} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1a1816]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-[#534741]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium text-[#f4e8c1] ${serifFontClass}`}>
                          {character.name}
                        </span>
                        <button
                          onClick={() => {
                            trackButtonClick("page", "跳转到此消息");
                            onTruncate(message.id);
                          }}
                          className="ml-1 w-6 h-6 flex items-center justify-center text-[#a18d6f] hover:text-green-400 bg-[#1c1c1c] rounded-lg border border-[#333333] shadow-inner transition-all duration-300 hover:border-[#444444] hover:shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                          aria-label={t("跳转到此消息")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <polyline points="17 1 21 5 17 9"></polyline>
                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                            <polyline points="7 23 3 19 7 15"></polyline>
                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <ChatHtmlBubble
                      html={message.content}
                      isLoading={
                        isSending && index === messages.length - 1 && message.content.trim() === ""
                      }
                      serifFontClass={serifFontClass}
                    />
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center space-x-2 text-[#c0a480] mb-4">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#f9c86d] border-r-[#c0a480] border-b-[#a18d6f] border-l-transparent animate-spin"></div>
                    <div className="absolute inset-1 rounded-full border-2 border-t-[#a18d6f] border-r-[#f9c86d] border-b-[#c0a480] border-l-transparent animate-spin-slow"></div>
                  </div>
                  <span className={`text-sm ${serifFontClass}`}>
                    {character.name} {t("characterChat.isTyping") || "is typing..."}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-[#1a1816] border-t border-[#534741] p-4 z-10">
        {suggestedInputs.length > 0 && !isSending && (
          <div className="flex flex-wrap gap-2 mb-4 max-w-4xl mx-auto">
            {suggestedInputs.map((input, index) => (
              <button
                key={index}
                onClick={() => {
                  trackButtonClick("page", "建议输入");
                  onSuggestedInput(input);
                }}
                disabled={isSending}
                className={`bg-[#2a261f] hover:bg-[#342f25] text-[#c0a480] hover:text-[#f4e8c1] py-1 px-3 rounded text-xs border border-[#534741] transition-colors menu-item ${
                  isSending ? "opacity-50 cursor-not-allowed" : ""
                } ${fontClass}`}
              >
                {input}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(event) => {
            trackFormSubmit("page", "提交表单");
            onSubmit(event);
          }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex gap-2">
            <div className="flex-grow magical-input">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={t("characterChat.typeMessage") || "Type a message..."}
                className="w-full bg-[#2a261f] border border-[#534741] rounded py-2 px-3 text-[#f4e8c1] text-sm leading-tight focus:outline-none focus:border-[#c0a480] transition-colors"
                disabled={isSending}
              />
            </div>
            {isSending ? (
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-t-[#f9c86d] border-r-[#c0a480] border-b-[#a18d6f] border-l-transparent animate-spin"></div>
                <div className="absolute inset-1 rounded-full border-2 border-t-[#a18d6f] border-r-[#f9c86d] border-b-[#c0a480] border-l-transparent animate-spin-slow"></div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!userInput.trim()}
                className={`portal-button bg-[#2a261f] hover:bg-[#342f25] text-[#c0a480] hover:text-[#f4e8c1] py-1 px-3 rounded text-sm border border-[#534741] transition-colors ${
                  !userInput.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {t("characterChat.send") || "Send"}
              </button>
            )}
          </div>

          <div className="mt-3 flex justify-start gap-3 max-w-4xl mx-auto">
            <button
              type="button"
              onClick={() => {
                trackButtonClick("page", "切换故事进度");
                setActiveModes((prev) => ({
                  ...prev,
                  "story-progress": !prev["story-progress"],
                }));
              }}
              className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                activeModes["story-progress"]
                  ? "bg-[#d1a35c] text-[#2a261f] border-[#d1a35c] shadow-[0_0_8px_rgba(209,163,92,0.5)]"
                  : "bg-[#2a261f] text-[#d1a35c] border-[#534741] hover:border-[#d1a35c]"
              }`}
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
                {t("characterChat.storyProgress") || "剧情推进"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                trackButtonClick("page", "切换视角");
                setActiveModes((prev) => {
                  const perspective = prev["perspective"];

                  if (!perspective.active) {
                    return {
                      ...prev,
                      perspective: {
                        active: true,
                        mode: "novel",
                      },
                    };
                  }

                  if (perspective.mode === "novel") {
                    return {
                      ...prev,
                      perspective: {
                        active: true,
                        mode: "protagonist",
                      },
                    };
                  }

                  return {
                    ...prev,
                    perspective: {
                      active: false,
                      mode: "novel",
                    },
                  };
                });
              }}
              className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                !activeModes["perspective"].active
                  ? "bg-[#2a261f] text-[#56b3b4] border-[#534741] hover:border-[#56b3b4]"
                  : activeModes["perspective"].mode === "novel"
                    ? "bg-[#56b3b4] text-[#2a261f] border-[#56b3b4] shadow-[0_0_8px_rgba(86,179,180,0.5)]"
                    : "bg-[#378384] text-[#2a261f] border-[#378384] shadow-[0_0_8px_rgba(55,131,132,0.5)]"
              }`}
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                {!activeModes["perspective"].active
                  ? t("characterChat.perspective") || "视角设计"
                  : activeModes["perspective"].mode === "novel"
                    ? t("characterChat.novelPerspective") || "小说视角"
                    : t("characterChat.protagonistPerspective") || "主角视角"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                trackButtonClick("page", "切换场景设置");
                setActiveModes((prev) => ({
                  ...prev,
                  "scene-setting": !prev["scene-setting"],
                }));
              }}
              className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                activeModes["scene-setting"]
                  ? "bg-[#c093ff] text-[#2a261f] border-[#c093ff] shadow-[0_0_8px_rgba(192,147,255,0.5)]"
                  : "bg-[#2a261f] text-[#c093ff] border-[#534741] hover:border-[#c093ff]"
              }`}
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
                {t("characterChat.sceneTransition")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
