import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

import MapGL, { Marker, Popup } from "@urbica/react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.poi.PointOfInterest

  const [viewport, setViewport] = useState({
    latitude: 40.7812,
    longitude: -73.9665,
    zoom: 13,
  })

  const [showPopup, setShowPopup] = useState(false)

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      <Bio />

      <MapGL
        style={{ width: "100%", height: "600px" }}
        mapStyle="mapbox://styles/mapbox/light-v9"
        accessToken={process.env.GATSBY_MAPBOX_KEY}
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        onViewportChange={setViewport}
      >
        {posts.map((poi, i) => {
          return (
            <Marker
              key={i}
              longitude={poi.location.longitude}
              latitude={poi.location.latitude}
              onClick={() => setShowPopup(poi)}
            >
              <svg
                height={10}
                viewBox="0 0 24 24"
                style={{
                  cursor: "pointer",
                  fill: "#d00",
                  stroke: "none",
                  transform: `translate(${-10 / 2}px,${-10}px)`,
                }}
              >
                <path
                  d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z"
                />
              </svg>
            </Marker>
          )
        })}

        {showPopup && (
          <Popup
            latitude={showPopup.location.latitude}
            longitude={showPopup.location.longitude}
            closeOnClick={false}
            tipSize={5}
            anchor="top"
            onClose={() => setShowPopup(null)}
          >
            <div>
              <strong>{showPopup.name}</strong> ({showPopup.type}) |{" "}
              <a target="_new" href={`/${showPopup.node_osm_id}`}>
                Details
              </a>
              <img width={240} src={showPopup.photos[0]} />
            </div>
          </Popup>
        )}
      </MapGL>

      {posts.map(node => {
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
        photos(first: 1)
        location {
          latitude
          longitude
        }
      }
    }
  }
`
