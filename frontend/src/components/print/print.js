export function printHTMLInNewWindow(html) {
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
    w.onload = () => {
      w.print()
      w.close()
    }
  }