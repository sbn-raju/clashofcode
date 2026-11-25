import { IconButton, Input, InputGroup, type InputProps } from "@chakra-ui/react"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function PasswordInput(props: InputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup
      endElement={
        <IconButton
          type="button"
          variant="ghost"
          size="xs"
          me="-2"
          color="fg.muted"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </IconButton>
      }
    >
      <Input {...props} type={visible ? "text" : "password"} />
    </InputGroup>
  )
}
