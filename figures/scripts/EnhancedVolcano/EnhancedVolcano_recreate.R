suppressPackageStartupMessages({library(EnhancedVolcano); library(ggplot2)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
res <- as.data.frame(readRDS("../_data/airway_deseq2.rds")$res); res <- res[!is.na(res$padj),]; res$symbol[is.na(res$symbol)] <- rownames(res)[is.na(res$symbol)]
# V1: default look
g <- EnhancedVolcano(res, lab = res$symbol, x = "log2FoldChange", y = "pvalue", title = "Dex vs untreated", subtitle = "EnhancedVolcano default")
ggsave("v1_default.png", g, width = 7, height = 7, dpi = 130)
# V2: selected genes boxed with connectors, padj on y
sel <- c("DUSP1","KLF15","PER1","TSC22D3","ZBTB16","FKBP5","CRISPLD2","SPARCL1","VCAM1","MT2A")
g <- EnhancedVolcano(res, lab = res$symbol, x = "log2FoldChange", y = "padj", selectLab = sel, ylab = bquote(~-Log[10]~adjusted~italic(P)), pCutoff = 1e-4, FCcutoff = 1.5,
  drawConnectors = TRUE, widthConnectors = .5, boxedLabels = TRUE, labSize = 3.5, legendPosition = "right", title = "Selected genes, boxed labels", subtitle = NULL)
ggsave("v2_selected_boxed.png", g, width = 9, height = 7, dpi = 130)
# V3: custom key-value colours (up/down only), no gridlines
kv <- ifelse(res$log2FoldChange < -1.5 & res$padj < 1e-4, "royalblue", ifelse(res$log2FoldChange > 1.5 & res$padj < 1e-4, "gold3", "grey80"))
names(kv)[kv == "gold3"] <- "Up"; names(kv)[kv == "grey80"] <- "NS"; names(kv)[kv == "royalblue"] <- "Down"
g <- EnhancedVolcano(res, lab = res$symbol, x = "log2FoldChange", y = "padj", colCustom = kv, pCutoff = 1e-4, FCcutoff = 1.5, pointSize = 2, gridlines.major = FALSE, gridlines.minor = FALSE, title = "Custom key-value colours", subtitle = NULL, labSize = 3)
ggsave("v3_custom_colours.png", g, width = 7, height = 7, dpi = 130)
