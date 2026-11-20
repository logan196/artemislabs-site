# tradeSeq GAM smoothers along slingshot lineages (La Manno 2018 dentate gyrus): smoothed gene trends,
# association-test heatmap of top dynamic genes, and a single-gene smoother on UMAP. Uses slingshot's fit (runs it if absent).
suppressPackageStartupMessages({library(tradeSeq); library(slingshot); library(SingleCellExperiment); library(ggplot2); library(pheatmap); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(7)
f <- "../slingshot/dg_slingshot_sce.rds"; if (!file.exists(f)) system("Rscript ../slingshot/slingshot_recreate.R"); sce <- readRDS(f)
cnt <- counts(sce); keep <- rowSums(cnt > 0) >= 50; genes <- names(sort(rowMeans(cnt[keep, ]), decreasing = TRUE))[1:400]
genes <- union(genes, intersect(c("Prox1","Neurod1","Calb1","Dcx","Sox11","Eomes","Hes5","Aldoc","Pdgfra","Mbp"), rownames(cnt)))
fit <- if (file.exists("tradeseq_fit.rds")) readRDS("tradeseq_fit.rds") else fitGAM(counts = cnt[genes, ], sds = SlingshotDataSet(sce), nknots = 6, verbose = FALSE, parallel = FALSE); saveRDS(fit, "tradeseq_fit.rds")
genes <- rownames(fit)
at <- associationTest(fit); top <- head(rownames(at)[order(at$waldStat, decreasing = TRUE)], 40); write.csv(at, "tradeseq_association.csv")
show <- head(unique(c(intersect(c("Dcx","Sox11","Calb1","Eomes","Neurod1","Prox1"), genes), top)), 4)
ps <- lapply(show, function(g) plotSmoothers(fit, cnt[genes, ], gene = g, alpha = .4, border = TRUE) + ggtitle(g))
ggsave("v1_plotSmoothers.png", wrap_plots(ps, ncol = 2), width = 10, height = 7.5, dpi = 130, bg = "white")
ys <- predictSmooth(fit, gene = top, nPoints = 50, tidy = FALSE); ys <- t(scale(t(log1p(ys)))); ann <- data.frame(lineage = sub("_[0-9]+$", "", sub("_point.*", "", colnames(ys))), row.names = colnames(ys)); ys[ys > 3] <- 3; ys[ys < -3] <- -3
png("v2_dynamic_gene_heatmap.png", 1500, 1300, res = 150); pheatmap(ys, cluster_cols = FALSE, show_colnames = FALSE, annotation_col = ann, color = colorRampPalette(c("#2166ac","white","#b2182b"))(100), main = "tradeSeq: top 40 lineage-associated genes (smoothed, z)", fontsize_row = 7, gaps_col = cumsum(table(ann$lineage))[-length(unique(ann$lineage))]); dev.off()
g <- if ("Dcx" %in% genes) "Dcx" else top[1]
ggsave("v3_plotGeneCount.png", plotGeneCount(SlingshotDataSet(sce), cnt[genes, ], gene = g, models = fit) + ggtitle(paste(g, "counts on UMAP with lineage curves")), width = 7, height = 6, dpi = 140, bg = "white")
