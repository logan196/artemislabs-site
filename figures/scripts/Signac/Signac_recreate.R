# Signac scATAC-seq coverage/track plots. NOTE: uses Signac's bundled 'atac_small' (human PBMC, 100 cells) and its
# fragments file - no offline neuro scATAC small enough was available (10x E18 mouse brain fragments are >1 GB).
suppressPackageStartupMessages({library(Signac); library(Seurat); library(ggplot2); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(1)
data(atac_small); fpath <- system.file("extdata", "fragments.tsv.gz", package = "Signac")
fragments <- CreateFragmentObject(fpath, cells = colnames(atac_small), validate.fragments = FALSE); Fragments(atac_small) <- NULL; Fragments(atac_small) <- fragments
atac_small$cluster <- factor(paste0("C", as.integer(atac_small$seurat_clusters)))
Idents(atac_small) <- "cluster"
reg <- "chr1-713500-860000"
p1 <- CoveragePlot(atac_small, region = reg, annotation = TRUE, peaks = TRUE, links = FALSE, extend.upstream = 0, extend.downstream = 0)
ggsave("v1_coverage_plot.png", p1 & theme(text = element_text(size = 9)), width = 9, height = 6, dpi = 140, bg = "white")
p2 <- TilePlot(atac_small, region = reg, tile.size = 500, tile.cells = 20)
ggsave("v2_tile_plot.png", p2 + ggtitle("Signac TilePlot: per-cell fragment tiles"), width = 9, height = 5, dpi = 140, bg = "white")
atac_small <- NucleosomeSignal(atac_small)
p3 <- FragmentHistogram(atac_small, region = "chr1-1-2000000", group.by = "cluster") + ggtitle("Fragment length histogram (nucleosome banding)")
p4 <- DimPlot(atac_small, reduction = "umap", group.by = "cluster", pt.size = 2) + ggtitle("LSI/UMAP clusters")
ggsave("v3_fraghist_umap.png", p3 + p4, width = 11, height = 4.5, dpi = 140, bg = "white")
