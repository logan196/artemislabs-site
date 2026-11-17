# speckle::propeller differential cell-type composition, Zeisel 2015: S1 cortex vs CA1 hippocampus,
# using the Fluidigm C1 chip ID (cell-name prefix) as the biological/technical replicate.
suppressPackageStartupMessages({library(speckle); library(limma); library(ggplot2); library(Seurat)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
so <- readRDS("../_data/zeisel_seurat.rds"); md <- so@meta.data
md$chip <- sub("_.*", "", rownames(md)); md$tissue <- so$tissue
keep <- names(which(table(md$chip) >= 20)); md <- md[md$chip %in% keep, ]
# shared cell types only (pyramidal subtypes are tissue-exclusive by definition)
md <- md[!grepl("pyramidal", md$celltype), ]; md$celltype <- droplevels(factor(md$celltype))
cat("chips per tissue:\n"); print(table(unique(md[, c("chip","tissue")])$tissue))
res <- propeller(clusters = md$celltype, sample = md$chip, group = md$tissue, transform = "logit")
write.csv(res, "propeller_results.csv"); print(res)
png("v1_plotCellTypeProps.png", 1300, 900, res = 150); print(plotCellTypeProps(clusters = md$celltype, sample = md$chip) + theme(axis.text.x = element_text(angle = 90, size = 6)) + ggtitle("Cell-type proportions per C1 chip")); dev.off()
props <- getTransformedProps(md$celltype, md$chip, transform = "logit")
grp <- unique(md[, c("chip","tissue")]); grp <- grp$tissue[match(colnames(props$Proportions), grp$chip)]
df <- data.frame(as.table(props$Proportions)); names(df) <- c("celltype","chip","prop"); df$tissue <- grp[match(df$chip, colnames(props$Proportions))]
df$label <- sprintf("%s\nFDR=%.2g", df$celltype, res$FDR[match(df$celltype, rownames(res))])
g <- ggplot(df, aes(tissue, prop, colour = tissue)) + geom_boxplot(outlier.shape = NA, width = .5) + geom_jitter(width = .15, size = 1.6) + facet_wrap(~ label, scales = "free_y", nrow = 1) + scale_colour_manual(values = c("#1b9e77","#d95f02")) + theme_bw() + theme(legend.position = "none") + labs(x = NULL, y = "proportion per chip", title = "propeller (logit) cortex vs CA1")
ggsave("v2_props_by_group.png", g, width = 12, height = 4.2, dpi = 140, bg = "white")
res$celltype <- rownames(res)
g3 <- ggplot(res, aes(log2(PropRatio), -log10(FDR), label = celltype, size = BaselineProp.Freq)) + geom_hline(yintercept = -log10(.05), linetype = 2, colour = "grey50") + geom_point(colour = "#7570b3", alpha = .8) + ggrepel::geom_text_repel(size = 3.5) + theme_bw() + labs(size = "baseline prop", title = "propeller: composition 'volcano'", x = "log2 proportion ratio (CA1 / cortex)")
ggsave("v3_composition_volcano.png", g3, width = 6.5, height = 5, dpi = 150, bg = "white")
