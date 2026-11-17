# slingshot lineages on La Manno 2018 dentate gyrus (granule + glial branches) on UMAP:
# principal curves over clusters, pseudotime colouring per lineage, and the cluster MST.
suppressPackageStartupMessages({library(slingshot); library(SingleCellExperiment); library(RColorBrewer); library(Matrix)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
D <- "../_data/dg_for_R"; if (!file.exists(file.path(D, "obs.csv"))) system("python3 ../_data/export_dg_for_R.py")
obs <- read.csv(file.path(D, "obs.csv"), row.names = 1); X <- as(readMM(file.path(D, "counts.mtx")), "CsparseMatrix"); dimnames(X) <- list(readLines(file.path(D, "genes.txt")), rownames(obs))
sce <- SingleCellExperiment(list(counts = X), colData = obs); reducedDim(sce, "UMAP") <- as.matrix(obs[, c("UMAP_1","UMAP_2")])
sce <- slingshot(sce, clusterLabels = "clusters", reducedDim = "UMAP", start.clus = "Radial Glia-like", approx_points = 150)
saveRDS(sce, "dg_slingshot_sce.rds")
cl <- factor(sce$clusters); pal <- setNames(brewer.pal(nlevels(cl), "Set2"), levels(cl)); um <- reducedDim(sce, "UMAP")
png("v1_curves_on_umap.png", 1300, 1100, res = 150); plot(um, col = pal[cl], pch = 16, cex = .5, asp = 1, xlab = "UMAP1", ylab = "UMAP2", main = "slingshot principal curves (start: radial glia-like)")
lines(SlingshotDataSet(sce), lwd = 3, col = "black"); legend("topright", legend = levels(cl), col = pal, pch = 16, cex = .7, bty = "n"); dev.off()
pt <- slingPseudotime(sce); n <- ncol(pt); png("v2_pseudotime_per_lineage.png", 600 * n, 600, res = 140); par(mfrow = c(1, n), mar = c(2,2,3,1))
cols <- colorRampPalette(rev(brewer.pal(11, "Spectral")))(100)
for (i in seq_len(n)) { v <- pt[, i]; cc <- ifelse(is.na(v), "grey90", cols[cut(v, 100)]); plot(um, col = cc, pch = 16, cex = .4, asp = 1, axes = FALSE, main = paste("Lineage", i, ":", paste(slingLineages(sce)[[i]], collapse = " > ")), cex.main = .6); lines(SlingshotDataSet(sce), linInd = i, lwd = 2) }
dev.off()
png("v3_cluster_MST.png", 1200, 1000, res = 150); plot(um, col = adjustcolor(pal[cl], .3), pch = 16, cex = .4, asp = 1, xlab = "UMAP1", ylab = "UMAP2", main = "slingshot cluster MST (lineage structure)"); lines(SlingshotDataSet(sce), type = "lineages", lwd = 2.5, col = "black", show.constraints = TRUE); dev.off()
