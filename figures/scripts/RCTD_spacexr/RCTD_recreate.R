# RCTD (spacexr) deconvolution of the 10x Visium mouse coronal brain (squidpy visium_hne; integer UMIs recovered,
# see _data/export_visium_for_R.py) with the Zeisel 2015 cortex/hippocampus reference. full mode.
# Cell-type weight maps, dominant-type map, and a spatial pie-chart (scatterpie) view.
suppressPackageStartupMessages({library(spacexr); library(Matrix); library(Seurat); library(ggplot2); library(patchwork); library(scatterpie)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(1)
D <- "../_data/visium_for_R"; if (!file.exists(file.path(D, "counts.mtx"))) system("python3 ../_data/export_visium_for_R.py")
obs <- read.csv(file.path(D, "obs.csv"), row.names = 1); X <- as(readMM(file.path(D, "counts.mtx")), "CsparseMatrix"); dimnames(X) <- list(readLines(file.path(D, "genes.txt")), rownames(obs))
so <- readRDS("../_data/zeisel_seurat.rds"); rc <- GetAssayData(so, layer = "counts"); ct <- factor(make.names(as.character(so$celltype))); names(ct) <- colnames(so)
ref <- Reference(round(rc), ct, nUMI = setNames(colSums(rc), colnames(rc)))
puck <- SpatialRNA(obs[, c("x","y")], X, nUMI = setNames(colSums(X), colnames(X)))
f <- "rctd_full.rds"; if (file.exists(f)) r <- readRDS(f) else { r <- create.RCTD(puck, ref, max_cores = 4, CELL_MIN_INSTANCE = 20); r <- run.RCTD(r, doublet_mode = "full"); saveRDS(r, f) }
W <- as.matrix(normalize_weights(r@results$weights)); df <- cbind(obs[rownames(W), c("x","y")], W)
ps <- lapply(colnames(W), function(k) ggplot(df, aes(x, -y, colour = .data[[k]])) + geom_point(size = .6) + scale_colour_viridis_c(option = "inferno", limits = c(0, 1)) + coord_fixed() + theme_void() + ggtitle(k) + theme(legend.position = "none", plot.title = element_text(size = 9)))
ggsave("v1_weight_maps.png", wrap_plots(ps, ncol = 4) + plot_annotation(title = "RCTD cell-type weights (Zeisel ref -> Visium mouse brain)"), width = 12, height = 6.5, dpi = 130, bg = "white")
df$dominant <- colnames(W)[max.col(W)]
ggsave("v2_dominant_type.png", ggplot(df, aes(x, -y, colour = dominant)) + geom_point(size = .9) + coord_fixed() + theme_void() + scale_colour_brewer(palette = "Set2") + ggtitle("RCTD dominant cell type per spot") + guides(colour = guide_legend(override.aes = list(size = 3))), width = 7, height = 6, dpi = 140, bg = "white")
sub <- df[df$x > quantile(df$x, .35) & df$x < quantile(df$x, .75) & df$y > quantile(df$y, .1) & df$y < quantile(df$y, .5), ]; sub$y <- -sub$y
r0 <- min(diff(sort(unique(round(sub$x))))[diff(sort(unique(round(sub$x)))) > 5]) * .9
ggsave("v3_scatterpie_zoom.png", ggplot() + geom_scatterpie(aes(x = x, y = y, r = r0), data = sub, cols = colnames(W), colour = NA) + coord_fixed() + theme_void() + scale_fill_brewer(palette = "Set2", name = "cell type") + ggtitle("Spatial pie charts (zoom: cortex/hippocampus region)"), width = 9, height = 7, dpi = 130, bg = "white")
