# igraph: gene co-expression network of variable genes in Zeisel cortex data
suppressPackageStartupMessages({library(igraph); library(Seurat)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
so <- readRDS("../_data/zeisel_seurat.rds"); g0 <- head(VariableFeatures(so), 150)
e <- as.matrix(GetAssayData(so, layer = "data")[g0,]); cm <- cor(t(e)); diag(cm) <- 0
adj <- (cm > .45) * cm; g <- graph_from_adjacency_matrix(adj, mode = "undirected", weighted = TRUE); g <- delete_vertices(g, degree(g) == 0)
set.seed(2); com <- cluster_louvain(g); pal <- hcl.colors(max(membership(com)), "Dark 3")
png("v1_fr_communities.png", 1300, 1300, res = 160)
plot(g, layout = layout_with_fr(g), vertex.color = pal[membership(com)], vertex.size = 3 + 1.2*sqrt(degree(g)), vertex.label.cex = .5, vertex.label.color = "black", edge.width = E(g)$weight*2, edge.color = "grey80", main = "Co-expression network (r > 0.45), Louvain communities"); dev.off()
png("v2_mark_groups.png", 1300, 1300, res = 160)
plot(com, g, layout = layout_with_kk(g), vertex.label = NA, vertex.size = 4, main = "Communities with group hulls (plot.communities)"); dev.off()
hub <- induced_subgraph(g, names(sort(degree(g), decreasing = TRUE))[1:25])
png("v3_circle_hubs.png", 1100, 1100, res = 160)
plot(hub, layout = layout_in_circle(hub), vertex.color = "#FDB863", vertex.size = 12, vertex.label.cex = .7, edge.width = E(hub)$weight*3, main = "Top-25 hub genes (circle layout)"); dev.off()
