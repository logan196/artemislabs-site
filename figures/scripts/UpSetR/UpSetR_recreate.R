# UpSetR: overlap of Zeisel 2015 cell-type marker sets (FindAllMarkers, adj p<0.01, log2FC>1)
suppressPackageStartupMessages({library(UpSetR); library(dplyr); library(ComplexHeatmap)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); if (!file.exists("../_data/zeisel_markers.csv")) system("Rscript ../_data/zeisel_de.R")
m <- read.csv("../_data/zeisel_markers.csv") %>% filter(p_val_adj < .01, avg_log2FC > 1); L <- split(m$gene, m$cluster)
png("v1_upset_frequency.png", 1600, 900, res = 150); print(upset(fromList(L), nsets = length(L), order.by = "freq", nintersects = 30, main.bar.color = "#2c7fb8", sets.bar.color = "#de2d26", text.scale = 1.2, mb.ratio = c(.6,.4))); dev.off()
png("v2_upset_degree_queries.png", 1600, 900, res = 150); print(upset(fromList(L), nsets = length(L), order.by = "degree", decreasing = FALSE, nintersects = 25, queries = list(list(query = intersects, params = list("pyramidal CA1","pyramidal SS"), color = "#e6550d", active = TRUE), list(query = intersects, params = list("astrocytes_ependymal"), color = "#31a354", active = TRUE)), text.scale = 1.2)); dev.off()
cm <- make_comb_mat(L, mode = "distinct"); cm <- cm[comb_size(cm) >= 10]
png("v3_complexheatmap_UpSet.png", 1700, 850, res = 150); draw(UpSet(cm, comb_order = order(-comb_size(cm)), top_annotation = upset_top_annotation(cm, add_numbers = TRUE), right_annotation = upset_right_annotation(cm, add_numbers = TRUE), column_title = "ComplexHeatmap::UpSet variant (intersections >= 10 genes)")); dev.off()
