suppressPackageStartupMessages({library(pheatmap); library(DESeq2); library(RColorBrewer); library(Seurat)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
x <- readRDS("../_data/airway_deseq2.rds"); dds <- x$dds; res <- x$res; vsd <- assay(vst(dds, blind = FALSE))
ann <- as.data.frame(colData(dds)[, c("dex","cell")])
# V1: top-50 variable genes, row z-score, annotation bar
top <- head(order(-matrixStats::rowVars(vsd)), 50); m <- vsd[top,]; rownames(m) <- ifelse(is.na(res[rownames(m),"symbol"]), rownames(m), res[rownames(m),"symbol"])
pheatmap(m, scale = "row", annotation_col = ann, show_colnames = FALSE, fontsize_row = 6, main = "Top 50 variable genes (row z-score)", filename = "v1_topvar_zscore.png", width = 6, height = 8)
# V2: sample-sample distance heatmap
d <- as.matrix(dist(t(vsd))); pheatmap(d, clustering_distance_rows = dist(t(vsd)), clustering_distance_cols = dist(t(vsd)), col = colorRampPalette(rev(brewer.pal(9,"Blues")))(255), annotation_col = ann, main = "Sample distances", filename = "v2_sample_distance.png", width = 6, height = 5)
# V3: DE genes with k-means/cutree gaps
sig <- rownames(res)[which(res$padj < 1e-10)]; m <- vsd[sig,]
pheatmap(m, scale = "row", cutree_rows = 2, cutree_cols = 2, show_rownames = FALSE, annotation_col = ann, color = colorRampPalette(c("navy","white","firebrick3"))(100), main = "DE genes, cutree gaps", filename = "v3_cutree.png", width = 5, height = 6)
# V4: single-cell marker average heatmap (Zeisel)
so <- readRDS("../_data/zeisel_seurat.rds")
mk <- c("Snap25","Gad1","Gad2","Pvalb","Sst","Satb2","Neurod6","Wfs1","Aqp4","Gfap","Mbp","Plp1","Mog","Cx3cr1","C1qa","Cldn5","Flt1","Acta2")
av <- AverageExpression(so, features = mk, group.by = "celltype")$RNA |> as.matrix()
pheatmap(log1p(av), scale = "row", cluster_rows = FALSE, angle_col = 45, display_numbers = FALSE, main = "Mouse cortex markers (mean expr, z)", filename = "v4_sc_markers.png", width = 5.5, height = 6)
