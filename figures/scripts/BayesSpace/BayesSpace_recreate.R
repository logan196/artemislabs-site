# BayesSpace on Maynard 2021 human DLPFC (151673): spot clusters, enhanced sub-spot resolution, enhanced gene maps
suppressPackageStartupMessages({library(BayesSpace); library(ggplot2); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); source("../_data/dlpfc_prep.R"); set.seed(149)
spe <- load_dlpfc(); sce <- SingleCellExperiment(assays = list(counts = counts(spe), logcounts = logcounts(spe)), colData = colData(spe)); sce$row <- sce$array_row; sce$col <- sce$array_col; xy <- spatialCoords(spe); sce$pxl_col_in_fullres <- xy[,1]; sce$pxl_row_in_fullres <- xy[,2]
sce <- spatialPreprocess(sce, platform = "Visium", n.PCs = 7, n.HVGs = 2000, log.normalize = FALSE)
sce <- spatialCluster(sce, q = 7, platform = "Visium", d = 7, init.method = "mclust", model = "t", gamma = 2, nrep = 5000, burn.in = 500)
pal <- c("#E41A1C","#377EB8","#4DAF4A","#984EA3","#FF7F00","#FFFF33","#A65628")
ggsave("v1_clusterPlot_vs_truth.png", patchwork::wrap_plots(list(clusterPlot(sce, palette = pal, color = NA) + ggtitle("BayesSpace (q=7)"), clusterPlot(sce, label = "ground_truth", palette = c(pal, "grey"), color = NA) + ggtitle("Manual layers (Maynard 2021)")), nrow = 1), width = 11, height = 5, dpi = 130, bg = "white")
enh <- if (file.exists("bayesspace_enhanced.rds")) readRDS("bayesspace_enhanced.rds") else spatialEnhance(sce, q = 7, platform = "Visium", d = 7, model = "t", gamma = 2, jitter.prior = .3, jitter.scale = 3.5, nrep = 1000, burn.in = 100, thin = 10, cores = 1, save.chain = FALSE)
ggsave("v2_enhanced_subspot.png", patchwork::wrap_plots(list(clusterPlot(sce, palette = pal, color = NA) + ggtitle("spot level"), clusterPlot(enh, palette = pal, color = NA) + ggtitle("enhanced (6 sub-spots/spot)")), nrow = 1), width = 11, height = 5, dpi = 130, bg = "white")
saveRDS(enh, "bayesspace_enhanced.rds")
genes <- intersect(c("MOBP","PCP4","SNAP25","HBB"), rownames(sce))
# enhanceFeatures(nrounds=0) is a per-gene linear model on PCs; done directly here so the enhanced object
# does not have to carry a full genes x sub-spots assay (that OOMs on a shared 15 GB box)
X <- reducedDim(sce, "PCA")[, 1:7]; Xe <- reducedDim(enh, "PCA")[, 1:7]
pred <- sapply(genes, function(g) { y <- as.numeric(logcounts(sce)[g, ]); f <- lm(y ~ X); cbind(1, Xe) %*% coef(f) })
ps <- lapply(genes, function(g) featurePlot(enh, pred[, g], color = NA) + ggtitle(g)); ggsave("v3_enhanced_genes.png", wrap_plots(ps, ncol = 2), width = 10, height = 9, dpi = 120, bg = "white")
saveRDS(sce, "bayesspace_sce.rds")
