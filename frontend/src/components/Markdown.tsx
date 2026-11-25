import { Box } from "@chakra-ui/react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

/** Renders problem statements written in Markdown (GFM). Raw HTML is not rendered. */
export function Markdown({ children }: { children: string }) {
  return (
    <Box
      color="fg"
      fontSize="sm"
      lineHeight="1.7"
      css={{
        "& > * + *": { marginTop: "0.85em" },
        "& h1, & h2, & h3": { fontFamily: "heading", fontWeight: 600, lineHeight: 1.3, marginTop: "1.3em" },
        "& h1": { fontSize: "lg" },
        "& h2": { fontSize: "md" },
        "& h3": { fontSize: "sm" },
        "& ul, & ol": { paddingLeft: "1.4em" },
        "& ul": { listStyleType: "disc" },
        "& ol": { listStyleType: "decimal" },
        "& li + li": { marginTop: "0.3em" },
        "& a": { color: "brand.400", textDecoration: "underline" },
        "& code": {
          fontFamily: "mono",
          fontSize: "0.9em",
          bg: "bg.muted",
          px: "1",
          py: "0.5",
          rounded: "sm",
        },
        "& pre": {
          fontFamily: "mono",
          bg: "bg.muted",
          p: "3",
          rounded: "md",
          overflowX: "auto",
          borderWidth: "1px",
          borderColor: "border",
        },
        "& pre code": { bg: "transparent", p: 0 },
        "& blockquote": { borderLeftWidth: "3px", borderColor: "border.emphasized", pl: "3", color: "fg.muted" },
        "& table": { borderCollapse: "collapse", width: "full" },
        "& th, & td": { borderWidth: "1px", borderColor: "border", px: "2", py: "1", textAlign: "left" },
        "& strong": { fontWeight: 600 },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </Box>
  )
}
