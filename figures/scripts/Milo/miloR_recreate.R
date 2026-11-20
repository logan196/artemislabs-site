# miloR differential abundance on kNN neighbourhoods, Zeisel 2015: S1 cortex vs CA1 hippocampus,
# Fluidigm C1 chip (cell-name prefix) as the replicate. Neighbourhood graph, DA beeswarm, nhood size histogram.
# NOTE: installed from Bioconductor source with src/Makevars patched (forces C++11; current RcppArmadillo needs C++14+).
suppressPackageStartupMessages({library(miloR); library(SingleCellExperiment); library(scater); library(Seurat); library(ggplot2); library(patchwork); library(dplyr)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(42)
so <- readRDS("../_data/zeisel_seurat.rds"); sce <- as.SingleCellExperiment(so)
sce$chip <- sub("_.*", "", colnames(sce)); keep <- names(which(table(sce$chip) >= 15)); sce <- sce[, sce$chip %in% keep]
reducedDim(sce, "PCA") <- Embeddings(so, "pca")[colnames(sce), 1:20]; reducedDim(sce, "UMAP") <- Embeddings(so, "umap")[colnames(sce), ]
m <- Milo(sce); m <- buildGraph(m, k = 20, d = 20, reduced.dim = "PCA"); m <- makeNhoods(m, prop = .1, k = 20, d = 20, refined = TRUE, reduced_dims = "PCA")
ggsave("v3_nhood_size_hist.png", plotNhoodSizeHist(m) + ggtitle("Milo neighbourhood sizes"), width = 5, height = 4, dpi = 140, bg = "white")
m <- countCells(m, meta.data = as.data.frame(colData(m)), sample = "chip")
design <- distinct(as.data.frame(colData(m))[, c("chip","tissue")]); rownames(design) <- design$chip; design <- design[colnames(nhoodCounts(m)), , drop = FALSE]
m <- calcNhoodDistance(m, d = 20, reduced.dim = "PCA")
da <- testNhoods(m, design = ~ tissue, design.df = design, reduced.dim = "PCA", fdr.weighting = "graph-overlap")
da <- annotateNhoods(m, da, coldata_col = "celltype"); write.csv(da, "milo_da_results.csv", row.names = FALSE)
m <- buildNhoodGraph(m)
p1 <- plotReducedDim(m, "UMAP", colour_by = "celltype", point_size = .6) + guides(colour = guide_legend(override.aes = list(size = 3))) + ggtitle("Zeisel cell types")
p2 <- plotNhoodGraphDA(m, da, layout = "UMAP", alpha = .1) + ggtitle("Milo nhood graph: logFC sscortex vs CA1")
ggsave("v1_nhood_graph_DA.png", p1 + p2 + plot_layout(widths = c(1, 1.1)), width = 13, height = 5.5, dpi = 130, bg = "white")
ggsave("v2_DA_beeswarm.png", plotDAbeeswarm(da, group.by = "celltype", alpha = .1) + theme_bw(base_size = 11) + ggtitle("Milo DA beeswarm by cell type (sscortex vs CA1)"), width = 8, height = 5.5, dpi = 140, bg = "white")
