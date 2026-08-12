import type { BlogBlock } from "@/data/blog";

export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="post-body">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "p":
            return <p key={idx}>{block.text}</p>;
          case "h2":
            return (
              <h2 key={idx} id={slugify(block.text)}>
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={idx} id={slugify(block.text)}>
                {block.text}
              </h3>
            );
          case "code":
            return (
              <pre key={idx} className="post-code">
                <code>{block.code}</code>
              </pre>
            );
          case "list":
            return block.ordered ? (
              <ol key={idx}>
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul key={idx}>
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={idx}>
                <p>{block.text}</p>
                {block.cite && <cite>{block.cite}</cite>}
              </blockquote>
            );
          case "callout":
            return (
              <div key={idx} className="post-callout">
                <div className="post-callout-label">{block.label}</div>
                <p>{block.text}</p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
