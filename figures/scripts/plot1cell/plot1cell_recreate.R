# plot1cell circular UMAP ("plot_circlize") + tracks, cell-fraction and multi-group dot plots on Zeisel 2015.
# plot1cell cannot be installed here (hard deps DoubletFinder/loomR/GEOquery/... unavailable for R 4.5), so its
# plotting functions are sourced verbatim from the GitHub repo (TheHumphreysLab/plot1cell, R/*.R) into src/.
suppressPackageStartupMessages({library(Seurat); library(circlize); library(ggplot2); library(dplyr); library(ggbeeswarm); library(RColorBrewer); library(grid)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(1)
R <- "https://raw.githubusercontent.com/TheHumphreysLab/plot1cell/master/R/"; dir.create("src", showWarnings = FALSE)
for (f in c("plot_circlize.R","utils.R","plot_cell_fraction.R","plot_dot.R")) { if (!file.exists(file.path("src", f))) download.file(paste0(R, f), file.path("src", f), quiet = TRUE); eval(parse(text = gsub("slot *= *", "layer = ", readLines(file.path("src", f))))) }  # SeuratObject 5: slot= -> layer=
so <- readRDS("../_data/zeisel_seurat.rds"); Idents(so) <- "celltype"; so$chip <- paste0("chip", sub("_.*", "", colnames(so)))
so$tissue <- factor(ifelse(so$tissue == "sscortex", "S1 cortex", "CA1"), levels = c("S1 cortex","CA1"))
cd <- prepare_circlize_data(so, scale = .75)
cols <- setNames(brewer.pal(8, "Set2")[seq_along(levels(so$celltype))], levels(so$celltype))
png("v1_circlize_umap.png", 1600, 1600, res = 200)
plot_circlize(cd, do.label = TRUE, pt.size = .5, col.use = cols, bg.color = "#F9F2E4", repel = FALSE, label.cex = .7)
add_track(cd, group = "tissue", colors = c("#1b9e77","#d95f02"), track_num = 2)
add_track(cd, group = "chip", track_num = 3, colors = colorRampPalette(brewer.pal(9, "Greys"))(length(unique(so$chip))))
dev.off()
png("v2_cell_fraction.png", 1500, 700, res = 130); g <- plot_cell_fraction(so, groupby = "tissue", show_replicate = TRUE, rep_colname = "chip"); if (inherits(g, "ggplot")) print(g); dev.off()
png("v3_complex_dotplot.png", 1000, 650, res = 140); g <- complex_dotplot_single(so, feature = "Mbp", groups = "tissue"); if (inherits(g, "ggplot")) print(g); dev.off()
