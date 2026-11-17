suppressPackageStartupMessages({library(ggspavis); library(ggplot2); library(SpatialExperiment); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); source("../_data/dlpfc_prep.R")
spe <- load_dlpfc(); spe$sum <- colSums(counts(spe)); spe$MOBP <- logcounts(spe)["MOBP",]
ggsave("v1_plotSpots_layers.png", plotCoords(spe, annotate = "ground_truth", pal = "libd_layer_colors", point_size = .6) + ggtitle("plotSpots"), width = 6, height = 5.5, dpi = 140, bg = "white")
ggsave("v2_plotVisium_HE.png", plotVisium(spe, annotate = "ground_truth", pal = "libd_layer_colors", point_size = .9) + ggtitle("plotVisium on H&E"), width = 6.5, height = 6, dpi = 140, bg = "white")
ggsave("v3_continuous_qc_gene.png", patchwork::wrap_plots(list(plotCoords(spe, annotate = "sum", point_size = .6) + ggtitle("UMIs"), plotCoords(spe, annotate = "MOBP", point_size = .6, pal = "viridis") + ggtitle("MOBP")), nrow = 1), width = 11, height = 5, dpi = 130, bg = "white")
