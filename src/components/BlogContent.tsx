import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * There's no native Markdown syntax for the two special blockquote styles
 * used across posts (a callout box, a quote with a citation line), so both
 * are authored as plain blockquotes with a documented convention (see the
 * helper text in the /admin editor) and detected structurally here:
 *   > **Label**            -> .post-callout, first line becomes the label
 *   > text
 *   > — Someone             -> plain quote, last line becomes <cite>
 *   > anything else         -> plain .post-body blockquote
 */

type ParagraphElement = React.ReactElement<{ children?: React.ReactNode }>;

function isElement(node: React.ReactNode): node is ParagraphElement {
  return React.isValidElement(node);
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isElement(node)) return extractText(node.props.children);
  return "";
}

function firstParagraphIsBold(paragraphs: ParagraphElement[]): boolean {
  const first = paragraphs[0];
  if (!first) return false;
  const firstChild = React.Children.toArray(first.props.children)[0];
  return isElement(firstChild) && firstChild.type === "strong";
}

function BlockquoteRenderer({ children }: { children?: React.ReactNode }) {
  const paragraphs = React.Children.toArray(children).filter(isElement);

  if (firstParagraphIsBold(paragraphs)) {
    const [labelPara, ...rest] = paragraphs;
    const label = extractText(labelPara.props.children);
    const body = rest.map((p) => extractText(p.props.children)).join(" ");
    return (
      <div className="post-callout">
        <div className="post-callout-label">{label}</div>
        <p>{body}</p>
      </div>
    );
  }

  const lastPara = paragraphs[paragraphs.length - 1];
  const lastText = lastPara ? extractText(lastPara.props.children).trim() : "";
  if (paragraphs.length > 1 && lastText.startsWith("— ")) {
    const mainText = paragraphs
      .slice(0, -1)
      .map((p) => extractText(p.props.children))
      .join(" ");
    return (
      <blockquote>
        <p>{mainText}</p>
        <cite>{lastText.slice(2)}</cite>
      </blockquote>
    );
  }

  return <blockquote>{children}</blockquote>;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function HeadingRenderer({ level, children }: { level: 2 | 3; children?: React.ReactNode }) {
  const id = slugify(extractText(children));
  const Tag = level === 2 ? "h2" : "h3";
  return <Tag id={id}>{children}</Tag>;
}

const components: Components = {
  h2: ({ children }) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
  h3: ({ children }) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
  pre: ({ children }) => <pre className="post-code">{children}</pre>,
  blockquote: BlockquoteRenderer,
};

export function BlogContent({ content }: { content: string }) {
  return (
    <div className="post-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
