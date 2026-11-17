suppressPackageStartupMessages({library(gprofiler2); library(ggplot2)})
# sandbox shim: curl::has_internet() uses a DNS probe that fails on this box even though HTTPS works
if (!curl::has_internet()) assignInNamespace("has_internet", function() TRUE, "curl")
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
set_base_url("https://biit.cs.ut.ee/gprofiler")  # HTTPS endpoint (port 80 is closed on this box)
res <- as.data.frame(readRDS("../_data/airway_deseq2.rds")$res); res <- res[!is.na(res$padj) & !is.na(res$symbol),]
up <- res$symbol[res$padj < .01 & res$log2FoldChange > 1]; dn <- res$symbol[res$padj < .01 & res$log2FoldChange < -1]
g <- gost(list(up = up, down = dn), organism = "hsapiens", multi_query = FALSE, sources = c("GO:BP","KEGG","REAC","TF"))
p <- gostplot(g, capped = TRUE, interactive = FALSE); ggsave("v1_manhattan.png", p, width = 9, height = 6, dpi = 130, bg = "white")
hl <- head(g$result$term_id[order(g$result$p_value)], 6)
png("v2_publish_highlight.png", 1500, 1300, res = 140); print(publish_gostplot(p, highlight_terms = hl)); dev.off()
png("v3_gosttable.png", 1500, 700, res = 140); print(publish_gosttable(g, highlight_terms = hl, show_columns = c("source","term_name","term_size","intersection_size"))); dev.off()
