# BANKSY spatial domains (neighbourhood-augmented clustering) on DLPFC 151673
suppressPackageStartupMessages({library(Banksy); library(SpatialExperiment); library(ggspavis); library(ggplot2); library(patchwork); library(scuttle)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); source("../_data/dlpfc_prep.R"); set.seed(1000)
spe <- load_dlpfc(); hvg <- scran::getTopHVGs(scran::modelGeneVar(spe), n = 2000); spe <- spe[hvg,]
assay(spe, "normcounts") <- as.matrix(normalizeCounts(spe, log = FALSE)); 
spe <- computeBanksy(spe, assay_name = "normcounts", compute_agf = TRUE, k_geom = c(15, 30))
spe <- runBanksyPCA(spe, use_agf = TRUE, lambda = c(0, .2), npcs = 20, seed = 1000)
spe <- clusterBanksy(spe, use_agf = TRUE, lambda = c(0, .2), resolution = .6, seed = 1000)
cn <- clusterNames(spe); spe <- connectClusters(spe)
spe$nonspatial <- factor(colData(spe)[[cn[1]]]); spe$banksy <- factor(colData(spe)[[cn[2]]])
ggsave("v1_banksy_vs_nonspatial.png", patchwork::wrap_plots(list(plotCoords(spe, annotate = "nonspatial", point_size = .6) + ggtitle("lambda = 0 (non-spatial)"), plotCoords(spe, annotate = "banksy", point_size = .6) + ggtitle("BANKSY lambda = 0.2"), plotCoords(spe, annotate = "ground_truth", pal = "libd_layer_colors", point_size = .6) + ggtitle("manual layers")), nrow = 1), width = 15, height = 5, dpi = 120, bg = "white")
spe <- runBanksyUMAP(spe, use_agf = TRUE, lambda = .2, npcs = 20)
u <- reducedDim(spe, grep("UMAP", reducedDimNames(spe), value = TRUE)[1]); d <- data.frame(u1 = u[,1], u2 = u[,2], domain = spe$banksy, layer = spe$ground_truth)
ggsave("v2_banksy_umap.png", patchwork::wrap_plots(list(ggplot(d, aes(u1, u2, color = domain)) + geom_point(size = .5) + theme_void() + ggtitle("BANKSY UMAP (domains)"), ggplot(d, aes(u1, u2, color = layer)) + geom_point(size = .5) + theme_void() + ggtitle("coloured by manual layer")), nrow = 1), width = 11, height = 5, dpi = 130, bg = "white")
