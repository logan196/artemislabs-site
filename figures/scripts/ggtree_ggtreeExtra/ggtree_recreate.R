# Circular dendrogram of Zeisel level2 subclasses (mean-expression distance) with ggtreeExtra rings
suppressPackageStartupMessages({library(ggtree); library(ggtreeExtra); library(ggplot2); library(Seurat); library(ape); library(ggnewscale)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
so <- readRDS("../_data/zeisel_seurat.rds"); av <- AverageExpression(so, features = VariableFeatures(so), group.by = "level2class")$RNA |> as.matrix()
colnames(av) <- gsub("-", "_", colnames(av)); tr <- as.phylo(hclust(as.dist(1 - cor(log1p(av))), "average"))
md <- so@meta.data; md$sub <- gsub("-", "_", md$level2class)
info <- unique(md[, c("sub","celltype")]); info <- info[!duplicated(info$sub),]; n <- as.data.frame(table(md$sub)); colnames(n) <- c("label","cells"); info <- merge(info, n, by.x = "sub", by.y = "label"); colnames(info)[1] <- "label"
p <- ggtree(tr, layout = "circular") %<+% info + geom_tippoint(aes(color = celltype), size = 2) + geom_tiplab(size = 2, offset = .02)
ggsave("v1_circular_tree.png", p + theme(legend.position = "right"), width = 8, height = 7, dpi = 140, bg = "white")
mk <- c("Gad1","Satb2","Aqp4","Mbp","Cx3cr1","Cldn5"); hm <- as.data.frame(scale(t(log1p(AverageExpression(so, features = mk, group.by = "level2class")$RNA |> as.matrix()))))
colnames(hm) <- mk; hm$label <- gsub("-", "_", rownames(hm))
# ring heatmap via ggtree::gheatmap (ggtreeExtra::geom_fruit is the alternative API for multi-ring layouts)
hmm <- as.matrix(hm[, mk]); rownames(hmm) <- hm$label
p2 <- gheatmap(ggtree(tr, layout = "fan", open.angle = 20) + geom_tiplab(size = 1.6, offset = .01, align = TRUE, linesize = .1), hmm, offset = .25, width = .6, colnames_angle = 90, font.size = 2) + scale_fill_gradient2(low = "#2166AC", high = "#B2182B", name = "z")
ggsave("v2_fan_heatmap_bar_rings.png", p2, width = 9, height = 8, dpi = 140, bg = "white")
p3 <- ggtree(tr) %<+% info + geom_tiplab(aes(color = celltype), size = 2.5) + geom_hilight(node = MRCA(tr, info$label[info$celltype == "interneurons"]), fill = "steelblue", alpha = .2) + geom_hilight(node = MRCA(tr, info$label[info$celltype == "oligodendrocytes"]), fill = "darkorange", alpha = .2) + xlim(0, max(node.depth.edgelength(tr)) * 1.6) + theme(legend.position = "bottom")
ggsave("v3_rect_tree_clade_highlights.png", p3, width = 7, height = 9, dpi = 140, bg = "white")
