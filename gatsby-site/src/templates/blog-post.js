import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.poi.PointOfInterest[0]
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext
  console.log(next)

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.name}
        description={post.type}
      />
      <article>
        <header>
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.name}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
            }}
          >
            {post.node_osm_id}
          </p>
        </header>
        <section>
            <ul>
              {post.tags?.map( (t,i) => {
                return <li><strong>{t.key}</strong>: {t.value}</li>
              })}
            </ul>
          </section>
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <footer>
          <Bio />
        </footer>
      </article>

      <nav>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.node_osm_id} rel="prev">
                ← {previous.name}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={`/` + next.node_osm_id} rel="next">
                {next.name} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: ID!) {
    site {
      siteMetadata {
        title
      }
    }
  poi {
    PointOfInterest(node_osm_id: $slug) {
      name
      type
      node_osm_id
      tags {
        key
        value
      }
    }
  }
}
`
