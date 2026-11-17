suppressPackageStartupMessages({library(ComplexHeatmap); library(circlize); library(DESeq2); library(Seurat)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
x <- readRDS("../_data/airway_deseq2.rds"); dds <- x$dds; res <- x$res; vsd <- assay(vst(dds, blind = FALSE))
sig <- rownames(res)[which(res$padj < 1e-8 & abs(res$log2FoldChange) > 1)]; m <- t(scale(t(vsd[sig,])))
ha <- HeatmapAnnotation(Treatment = dds$dex, Donor = dds$cell, col = list(Treatment = c(untrt = "#4DAF4A", trt = "#984EA3")))
ra <- rowAnnotation(log2FC = anno_barplot(res[sig,"log2FoldChange"], gp = gpar(fill = ifelse(res[sig,"log2FoldChange"]>0,"#D7301F","#2B8CBE")), width = unit(2,"cm")))
lab <- head(sig[order(res[sig,"padj"])], 12)
# V1: annotated, row-split by direction, with gene marks
png("v1_annotated_split.png", 1200, 1500, res = 170)
draw(Heatmap(m, name = "z", col = colorRamp2(c(-2,0,2), c("#2166AC","white","#B2182B")), top_annotation = ha, right_annotation = ra,
  row_split = ifelse(res[sig,"log2FoldChange"] > 0, "Up in dex", "Down in dex"), column_split = dds$dex, show_row_names = FALSE,
  left_annotation = rowAnnotation(mark = anno_mark(at = match(lab, sig), labels = res[lab,"symbol"], side = "left"))) )
dev.off()
# V2: single-cell marker heatmap (cells subsampled) with cell-type annotation
so <- readRDS("../_data/zeisel_seurat.rds"); set.seed(1); cells <- unlist(lapply(split(colnames(so), so$celltype), function(v) sample(v, min(60, length(v)))))
mk <- c("Snap25","Gad1","Pvalb","Sst","Satb2","Neurod6","Wfs1","Aqp4","Gfap","Mbp","Plp1","Cx3cr1","C1qa","Cldn5","Flt1","Acta2")
e <- as.matrix(GetAssayData(so, layer = "data")[mk, cells]); ct <- so$celltype[cells]
cols <- setNames(scales::hue_pal()(nlevels(ct)), levels(ct))
png("v2_singlecell_markers.png", 1600, 1000, res = 170)
draw(Heatmap(e, name = "log-norm", col = colorRamp2(c(0,1.5,3), c("white","#FDAE61","#A50026")), cluster_columns = FALSE, cluster_rows = FALSE, show_column_names = FALSE,
  column_split = ct, column_title_rot = 30, column_title_gp = gpar(fontsize = 8), top_annotation = HeatmapAnnotation(celltype = ct, col = list(celltype = cols), show_legend = FALSE), use_raster = TRUE))
dev.off()
# V3: correlation heatmap with values printed (cell_fun)
av <- AverageExpression(so, features = VariableFeatures(so), group.by = "celltype")$RNA |> as.matrix(); cm <- cor(log1p(av))
png("v3_correlation_cellfun.png", 1200, 1050, res = 170)
draw(Heatmap(cm, name = "Pearson r", col = colorRamp2(c(min(cm),1), c("white","#08519C")), cell_fun = function(j,i,x,y,w,h,fill) grid.text(sprintf("%.2f", cm[i,j]), x, y, gp = gpar(fontsize = 7)), rect_gp = gpar(col = "white", lwd = 1)))
dev.off()
# V4: densityHeatmap of per-sample expression distributions + oncoPrint-style is in queued variations
png("v4_densityHeatmap.png", 1100, 800, res = 170); draw(densityHeatmap(vsd, top_annotation = ha, title = "vst expression distributions", ylab = "vst")); dev.off()
