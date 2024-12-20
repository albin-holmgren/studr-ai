import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { useCallback } from 'react'
import { DropdownButton } from '~/components/new-ui/Dropdown'
import { Icon } from '~/components/new-ui/Icon'
import { Surface } from '~/components/new-ui/Surface'
import { Toolbar } from '~/components/new-ui/Toolbar'
import { Language } from '~/extensions/Ai'
import { languages, tones } from '~/new-lib/constants'
import { useEditor } from '@tiptap/react'

export type AIDropdownProps = {
  editor: ReturnType<typeof useEditor>
}

export const AIDropdown = ({ editor }: AIDropdownProps) => {
  const handleAction = useCallback((action: string, param?: string) => {
    if (!editor) return
    editor.commands.aiProcess(action, param)
  }, [editor])

  const handleTone = useCallback((tone: string) => () => handleAction('tone', tone), [handleAction])
  const handleTranslate = useCallback((language: Language) => () => handleAction('translate', language), [handleAction])

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Toolbar.Button
          className="text-purple-500 hover:text-purple-600 active:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 dark:active:text-purple-400"
          activeClassname="text-purple-600 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-200"
        >
          <Icon name="Sparkles" className="mr-1" />
          AI Tools
          <Icon name="ChevronDown" className="w-2 h-2 ml-1" />
        </Toolbar.Button>
      </Dropdown.Trigger>
      <Dropdown.Content asChild>
        <Surface className="p-2 min-w-[10rem]">
          <Dropdown.Item onClick={() => handleAction('simplify')}>
            <DropdownButton>
              <Icon name="CircleSlash" />
              Simplify
            </DropdownButton>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleAction('fixSpelling')}>
            <DropdownButton>
              <Icon name="Eraser" />
              Fix spelling & grammar
            </DropdownButton>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleAction('makeShorter')}>
            <DropdownButton>
              <Icon name="ArrowLeftToLine" />
              Make shorter
            </DropdownButton>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleAction('makeLonger')}>
            <DropdownButton>
              <Icon name="ArrowRightToLine" />
              Make longer
            </DropdownButton>
          </Dropdown.Item>
          <Dropdown.Sub>
            <Dropdown.SubTrigger>
              <DropdownButton>
                <Icon name="Mic" />
                Change tone
                <Icon name="ChevronRight" className="w-4 h-4 ml-auto" />
              </DropdownButton>
            </Dropdown.SubTrigger>
            <Dropdown.SubContent>
              <Surface className="flex flex-col min-w-[15rem] p-2 max-h-[20rem] overflow-auto">
                {tones.map(tone => (
                  <Dropdown.Item onClick={handleTone(tone.value)} key={tone.value}>
                    <DropdownButton>{tone.label}</DropdownButton>
                  </Dropdown.Item>
                ))}
              </Surface>
            </Dropdown.SubContent>
          </Dropdown.Sub>
          <Dropdown.Item onClick={() => handleAction('tldr')}>
            <DropdownButton>
              <Icon name="Ellipsis" />
              Tl;dr:
            </DropdownButton>
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleAction('emojify')}>
            <DropdownButton>
              <Icon name="SmilePlus" />
              Add emojis
            </DropdownButton>
          </Dropdown.Item>
          <Dropdown.Sub>
            <Dropdown.SubTrigger>
              <DropdownButton>
                <Icon name="Languages" />
                Translate
                <Icon name="ChevronRight" className="w-4 h-4 ml-auto" />
              </DropdownButton>
            </Dropdown.SubTrigger>
            <Dropdown.SubContent>
              <Surface className="flex flex-col min-w-[15rem] p-2 max-h-[20rem] overflow-auto">
                {languages.map(language => (
                  <Dropdown.Item onClick={handleTranslate(language.value)} key={language.value}>
                    <DropdownButton>{language.label}</DropdownButton>
                  </Dropdown.Item>
                ))}
              </Surface>
            </Dropdown.SubContent>
          </Dropdown.Sub>
          <Dropdown.Item onClick={() => handleAction('completeSentence')}>
            <DropdownButton>
              <Icon name="Terminal" />
              Complete sentence
            </DropdownButton>
          </Dropdown.Item>
        </Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  )
}
