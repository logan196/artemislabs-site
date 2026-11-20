# DESeq2 built-in diagnostic plots (canonical bulk RNA-seq QC/DE figures)
# Data: airway (dexamethasone vs untreated); see ../_data/prep_data.R
suppressPackageStartupMessages({library(DESeq2); library(ggplot2)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
x <- readRDS("../_data/airway_deseq2.rds"); dds <- x$dds; res <- x$res
vsd <- vst(dds, blind = FALSE)
# V1: plotPCA (the most-reused DESeq2 figure)
p <- plotPCA(vsd, intgroup = c("dex","cell"), returnData = TRUE); pv <- round(100*attr(p,"percentVar"))
g <- ggplot(p, aes(PC1, PC2, color = dex, shape = cell)) + geom_point(size = 4) +
  xlab(paste0("PC1: ", pv[1], "% variance")) + ylab(paste0("PC2: ", pv[2], "% variance")) + coord_fixed() + theme_bw() + ggtitle("DESeq2 plotPCA (vst)")
ggsave("v1_plotPCA.png", g, width = 6, height = 4.5, dpi = 150)
# V2: MA plot with apeglm-shrunken LFC
resLFC <- lfcShrink(dds, coef = "dex_trt_vs_untrt", type = "apeglm")
png("v2_plotMA_shrunken.png", 1000, 750, res = 150); plotMA(resLFC, ylim = c(-5,5), main = "plotMA (apeglm LFC shrinkage)"); dev.off()
# V3: dispersion estimates
png("v3_plotDispEsts.png", 1000, 750, res = 150); plotDispEsts(dds, main = "plotDispEsts"); dev.off()
# V4: plotCounts for top gene
top <- rownames(res)[which.min(res$padj)]
d <- plotCounts(dds, gene = top, intgroup = "dex", returnData = TRUE)
g <- ggplot(d, aes(dex, count, color = dex)) + geom_point(position = position_jitter(w = .1, h = 0), size = 3) + scale_y_log10() + theme_bw() +
  ggtitle(paste("plotCounts:", res[top,"symbol"]))
ggsave("v4_plotCounts.png", g, width = 4.5, height = 4, dpi = 150)
