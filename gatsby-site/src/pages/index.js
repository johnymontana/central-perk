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
      {posts.map( (node) => {
        const title = node.name
        return (
          <article key={node.node_osm_id}>
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
              
            </header>
            
          </article>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  {
  site {
    siteMetadata {
      title
    }
  }
  poi {
    PointOfInterest {
      node_osm_id
      name
      type
      location {
        latitude
        longitude
      }
    }
  }
}
`
