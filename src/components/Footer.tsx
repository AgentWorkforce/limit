export function Footer() {
  return (
    <box
      style={{
        width: "100%",
        height: 1,
        flexDirection: "row",
        paddingLeft: 2,
        paddingRight: 2,
      }}
    >
      <text fg="#6b7280">
        <span fg="#9ca3af">q</span>: quit{"  "}
        <span fg="#9ca3af">r</span>: refresh{"  "}
        <span fg="#9ca3af">?</span>: help
      </text>
    </box>
  );
}
