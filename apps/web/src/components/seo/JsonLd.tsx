/** Renders one JSON-LD `<script>` block. Server component — no client JS. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      // escape "<" so a future value containing e.g. "</script>" can't break out of the tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
