# ggraph / tidygraph: Zeisel 2015 marker co-expression network (force layout, communities), circular cell-type
# dendrogram, and circle-packing of cell-type -> Louvain sub-cluster hierarchy.
suppressPackageStartupMessages({library(ggraph); library(tidygraph); library(igraph); library(Seurat); library(dplyr); library(ggplot2)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(3); if (!file.exists("../_data/zeisel_markers.csv")) system("Rscript ../_data/zeisel_de.R")
so <- readRDS("../_data/zeisel_seurat.rds"); m <- read.csv("../_data/zeisel_markers.csv") %>% filter(p_val_adj < .01) %>% group_by(cluster) %>% slice_max(avg_log2FC, n = 15) %>% ungroup() %>% distinct(gene, .keep_all = TRUE)
X <- as.matrix(GetAssayData(so, layer = "data")[m$gene, ]); C <- cor(t(X)); C[lower.tri(C, diag = TRUE)] <- NA
e <- as.data.frame(as.table(C)) %>% filter(!is.na(Freq), Freq > .35); names(e) <- c("from","to","r")
g <- tbl_graph(nodes = data.frame(name = m$gene, celltype = m$cluster), edges = e, directed = FALSE) %>% activate(nodes) %>% mutate(deg = centrality_degree(), comm = as.factor(group_louvain()))
p1 <- ggraph(g, "fr") + geom_edge_link(aes(alpha = r), colour = "grey50") + geom_node_point(aes(colour = celltype, size = deg)) + geom_node_text(aes(label = name), repel = TRUE, size = 2.4) + theme_graph(base_family = "sans") + ggtitle("Marker co-expression network (r > 0.35)")
ggsave("v1_coexpression_network.png", p1, width = 10, height = 8, dpi = 130, bg = "white")
av <- AverageExpression(so, features = m$gene, group.by = "celltype", assays = "RNA")$RNA; hc <- hclust(dist(t(log1p(as.matrix(av)))), "average")
p2 <- ggraph(as_tbl_graph(hc), "dendrogram", circular = TRUE) + geom_edge_elbow(colour = "grey40") + geom_node_point(aes(filter = leaf), size = 4, colour = "#d95f02") + geom_node_text(aes(label = label, filter = leaf), size = 3.5, nudge_y = -.4) + coord_fixed() + theme_graph(base_family = "sans") + ggtitle("Circular cell-type dendrogram")
ggsave("v2_circular_dendrogram.png", p2, width = 7, height = 7, dpi = 140, bg = "white")
h <- data.frame(from = "Zeisel", to = unique(as.character(so$celltype))) %>% bind_rows(so@meta.data %>% transmute(from = as.character(celltype), to = paste0(celltype, "_c", seurat_clusters)) %>% distinct())
sz <- table(paste0(so$celltype, "_c", so$seurat_clusters)); vt <- data.frame(name = unique(c(h$from, h$to))); vt$size <- ifelse(vt$name %in% names(sz), as.numeric(sz[vt$name]), 0); vt$level <- ifelse(vt$name == "Zeisel", 0, ifelse(vt$name %in% names(sz), 2, 1))
gp <- graph_from_data_frame(h, vertices = vt)
p3 <- ggraph(gp, "circlepack", weight = size) + geom_node_circle(aes(fill = factor(level)), colour = "white") + geom_node_text(aes(label = name, filter = level == 1), size = 3) + scale_fill_manual(values = c("#f0f0f0","#bdd7e7","#3182bd"), guide = "none") + coord_fixed() + theme_void() + ggtitle("Circle-pack: cell type -> Louvain cluster (area = cells)")
ggsave("v3_circlepack.png", p3, width = 7, height = 7, dpi = 140, bg = "white")
