import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.poi.PointOfInterest

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      <Bio />
      { posts.map(  (node, i) => {
        const title = node.name
        return (
          <article key={node.osm_node_id}>
            <header>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.node_osm_id}>
                  {title}
                </Link>
              </h3>
              <small>{node.osm_node_id}</small>
            </header>
            
          </article>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    poi {
    PointOfInterest {
      name
      type
      node_osm_id
    }
  }
  }
`
