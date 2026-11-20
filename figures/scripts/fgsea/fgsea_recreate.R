suppressPackageStartupMessages({library(fgsea); library(msigdbr); library(ggplot2); library(data.table)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
res <- as.data.frame(readRDS("../_data/airway_deseq2.rds")$res); res <- res[!is.na(res$stat) & !is.na(res$symbol),]
rk <- sort(tapply(res$stat, res$symbol, mean), decreasing = TRUE)
h <- msigdbr(species = "Homo sapiens", collection = "H"); pw <- split(h$gene_symbol, h$gs_name)
set.seed(1); fr <- fgsea(pw, rk, minSize = 15, maxSize = 500); fr <- fr[order(pval)]
top <- fr$pathway[1]
ggsave("v1_plotEnrichment.png", plotEnrichment(pw[[top]], rk) + labs(title = top, subtitle = sprintf("NES = %.2f, padj = %.1e", fr$NES[1], fr$padj[1])), width = 6.5, height = 4, dpi = 150, bg = "white")
tp <- c(fr[ES > 0][head(order(pval), 6), pathway], rev(fr[ES < 0][head(order(pval), 6), pathway]))
png("v2_plotGseaTable.png", 1500, 900, res = 140); print(plotGseaTable(pw[tp], rk, fr, gseaParam = .5)); dev.off()
fr2 <- fr[padj < .1]; fr2$pathway <- factor(sub("HALLMARK_","",fr2$pathway), levels = sub("HALLMARK_","",fr2$pathway[order(fr2$NES)]))
g <- ggplot(fr2, aes(NES, pathway, fill = -log10(padj))) + geom_col() + scale_fill_viridis_c() + theme_minimal() + labs(y = NULL, title = "Hallmark NES (padj < 0.1)")
ggsave("v3_NES_barplot.png", g, width = 7, height = 6, dpi = 150, bg = "white")
