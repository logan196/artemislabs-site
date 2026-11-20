# ggplot2: the grammar-of-graphics backbone of most omics figures
suppressPackageStartupMessages({library(ggplot2); library(ggrepel); library(dplyr)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
res <- read.csv("../_data/airway_deseq2_results.csv"); obs <- read.csv("../_data/zeisel_obs.csv")
res <- res |> filter(!is.na(padj)) |> mutate(sig = case_when(padj < .05 & log2FoldChange > 1 ~ "Up", padj < .05 & log2FoldChange < -1 ~ "Down", TRUE ~ "NS"))
lab <- res |> filter(sig != "NS") |> arrange(padj) |> head(15)
# V1: volcano plot
g <- ggplot(res, aes(log2FoldChange, -log10(padj), color = sig)) + geom_point(size = .8, alpha = .7) +
  scale_color_manual(values = c(Up = "#D7301F", Down = "#2B8CBE", NS = "grey75")) + geom_vline(xintercept = c(-1,1), lty = 2) + geom_hline(yintercept = -log10(.05), lty = 2) +
  geom_text_repel(data = lab, aes(label = symbol), size = 3, max.overlaps = 30, show.legend = FALSE) + theme_classic() + labs(title = "Volcano (ggplot2 + ggrepel)")
ggsave("v1_volcano.png", g, width = 6, height = 5, dpi = 150)
# V2: UMAP scatter by cell type (Zeisel cortex/hippocampus)
g <- ggplot(obs, aes(UMAP_1, UMAP_2, color = celltype)) + geom_point(size = .5) + theme_void() + guides(color = guide_legend(override.aes = list(size = 3))) + ggtitle("UMAP (ggplot2)") + coord_fixed()
ggsave("v2_umap.png", g, width = 6.5, height = 4.5, dpi = 150, bg = "white")
# V3: composition stacked bar (cell type by tissue)
g <- obs |> count(tissue, celltype) |> group_by(tissue) |> mutate(f = n/sum(n)) |> ggplot(aes(tissue, f, fill = celltype)) + geom_col(width = .7) + scale_y_continuous(labels = scales::percent) + theme_minimal() + labs(y = "Fraction of cells", title = "Cell-type composition")
ggsave("v3_composition_bar.png", g, width = 5, height = 4.5, dpi = 150)
# V4: violin + box of QC metric per cell type
g <- ggplot(obs, aes(celltype, nFeature_RNA, fill = celltype)) + geom_violin(scale = "width") + geom_boxplot(width = .12, outlier.shape = NA, fill = "white") + theme_classic() + theme(axis.text.x = element_text(angle = 40, hjust = 1), legend.position = "none") + labs(title = "Genes detected per cell")
ggsave("v4_violin_box.png", g, width = 6, height = 4.5, dpi = 150)
