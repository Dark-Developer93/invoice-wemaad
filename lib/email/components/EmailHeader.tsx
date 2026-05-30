interface EmailHeaderProps {
  badgeLabel: string;
  badgeBackground: string;
  badgeColor: string;
}

const header = {
  textAlign: "left" as const,
  marginBottom: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brand = {
  fontSize: "24px",
  fontWeight: 600,
  color: "#18181b",
};

const brandSpan = {
  color: "#3b82f6",
};

const badgeBase = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: 500,
};

export function EmailHeader({
  badgeLabel,
  badgeBackground,
  badgeColor,
}: EmailHeaderProps) {
  return (
    <div style={header}>
      <div style={brand}>
        Invoice<span style={brandSpan}>WeMaAd</span>
      </div>
      <div style={{ ...badgeBase, backgroundColor: badgeBackground, color: badgeColor }}>
        {badgeLabel}
      </div>
    </div>
  );
}
