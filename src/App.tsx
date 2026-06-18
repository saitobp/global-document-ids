import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateEcuadorCedula, generateEcuadorEdgeCases } from "@/lib/ecuador";
import { generateRUT, formatRUT, generateChileEdgeCases } from "@/lib/chile";

function IdRow({
  value,
  label,
  description,
  isEdgeCase = false,
}: {
  value: string;
  label?: string;
  description?: string;
  isEdgeCase?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        {label && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            {isEdgeCase && (
              <Badge
                variant="secondary"
                className="text-[10px] h-4 px-1.5 leading-none"
              >
                edge case
              </Badge>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground/60 leading-tight">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center shrink-0">
        <code
          onClick={copy}
          className="text-sm font-mono bg-muted px-2 py-0.5 rounded cursor-pointer hover:bg-muted/70 transition-colors"
          title="Click to copy"
        >
          {value}
        </code>
        <button
          onClick={copy}
          className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
    </div>
  );
}

type EdgeCase = { label: string; code: string; description: string };

type DocumentCard = {
  country: string;
  docType: string;
  generated: string;
  edgeCases: EdgeCase[];
  format?: (code: string) => string;
};

function buildIds(): DocumentCard[] {
  return [
    {
      country: "Ecuador",
      docType: "Cédula de Identidad",
      generated: generateEcuadorCedula(),
      edgeCases: generateEcuadorEdgeCases(),
    },
    {
      country: "Chile",
      docType: "RUT",
      generated: generateRUT(),
      edgeCases: generateChileEdgeCases(),
      format: formatRUT,
    },
  ];
}

export default function App() {
  const [ids, setIds] = useState<DocumentCard[]>(() => buildIds());

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Document ID Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Valid IDs for testing — click copy on any code to use it
            </p>
          </div>
          <Button onClick={() => setIds(buildIds())} variant="outline" size="sm">
            Re-generate
          </Button>
        </div>

        {ids.map((doc) => {
          const displayGenerated = doc.format
            ? doc.format(doc.generated)
            : doc.generated;

          return (
            <Card key={doc.country}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{doc.country}</CardTitle>
                  <Badge variant="outline" className="text-xs font-normal">
                    {doc.docType}
                  </Badge>
                </div>
                <CardDescription>Random valid ID</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-0">
                <IdRow value={displayGenerated} label="Generated" />
                {doc.edgeCases.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground mt-3 mb-1 font-medium uppercase tracking-wide">
                      Edge cases
                    </p>
                    {doc.edgeCases.map((ec) => {
                      const display = doc.format
                        ? doc.format(ec.code)
                        : ec.code;
                      return (
                        <IdRow
                          key={ec.code}
                          value={display}
                          label={ec.label}
                          description={ec.description}
                          isEdgeCase
                        />
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
