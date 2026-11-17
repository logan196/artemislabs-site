# scplotter (pwwang; plotthis backend) on Zeisel 2015: hull-marked and hex CellDimPlot, CellStatPlot as
# circos / radar / ring of cell-type composition by tissue, and FeatureStatPlot ridge/violin of markers.
# Installed from GitHub (pwwang/plotthis, pwwang/scplotter); not on CRAN for R 4.5.
suppressPackageStartupMessages({library(scplotter); library(Seurat); library(ggplot2); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(1)
so <- readRDS("../_data/zeisel_seurat.rds"); so$tissue <- factor(ifelse(so$tissue == "sscortex", "S1 cortex", "CA1"))
so$chip <- paste0("chip", sub("_.*", "", colnames(so))); Idents(so) <- "celltype"
p1 <- CellDimPlot(so, group_by = "celltype", reduction = "umap", theme = "theme_blank", add_mark = TRUE, mark_type = "hull", label = TRUE, label_insitu = TRUE, title = "CellDimPlot with hull marks")
p1b <- CellDimPlot(so, group_by = "celltype", reduction = "umap", theme = "theme_blank", hex = TRUE, hex_bins = 40, title = "hex-binned")
ggsave("v1_celldimplot.png", p1 + p1b, width = 13, height = 5.5, dpi = 130, bg = "white")
png("v2_cellstat_circos.png", 1400, 1400, res = 170); print(CellStatPlot(so, ident = "celltype", group_by = "tissue", plot_type = "circos", title = "Composition by tissue (circos)")); dev.off() #, dpi = 140, bg = "white")
ggsave("v3_cellstat_radar_ring.png", CellStatPlot(so, ident = "celltype", group_by = "tissue", plot_type = "radar", frac = "group", title = "radar") + CellStatPlot(so, ident = "celltype", group_by = "tissue", plot_type = "ring", frac = "group", title = "ring"), width = 13, height = 6, dpi = 130, bg = "white")
ggsave("v4_featurestat_ridge.png", FeatureStatPlot(so, features = c("Snap25","Gad1","Mbp","Aqp4","Cx3cr1","Cldn5"), ident = "celltype", plot_type = "ridge", stack = TRUE, flip = TRUE, title = "Marker ridges"), width = 10, height = 6, dpi = 130, bg = "white")
