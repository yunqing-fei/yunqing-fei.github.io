# BOCI Report Email Builder

Open `index.html` in a browser, or use the local preview URL while the server is running:

```text
http://127.0.0.1:4173/index.html
```

## Analyst emails

The preset analyst email list is editable in the page. It starts with placeholder addresses and this shape:

```json
{
  "Tony FEI": {
    "email": "tony.fei@fill-later.example",
    "zhName": "费云青"
  }
}
```

Fill in each real `email` value when available. The generated output will link both the English analyst name and the Chinese analyst name to the same email address.

## Report links

Paste the published report URL into the `Report link` field before generating. The tool uses that URL for the “Click here to read the report” line only. The title line keeps the large blue title formatting from the reference `.eml`, but it is not hyperlinked.

## Title and bullet formatting

The `Email title line` field is filled automatically from the pasted notification. Edit it before generating when an exact title is required; manually entered text is preserved as written.

The free-text section is arranged as English bullets followed by the Chinese title, analyst names, and Chinese bullets. Markers copied from common email formats are supported, including `(i)`, `（i）`, `[i]`, and Unicode Roman numerals such as `（ⅰ）`.

## Outlook copying

Use `Copy for Outlook` to copy the rendered email, including its inline fonts, sizes, colors, emphasis, links, and paragraph spacing. Paste directly into an Outlook draft with normal paste. `Copy text` intentionally removes rich formatting.
