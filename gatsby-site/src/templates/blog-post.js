import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"

import MapGL, { Source, Layer, Marker } from "@urbica/react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"

import { useLazyQuery, gql } from "@apollo/client"

const GET_ROUTE_QUERY = gql`
  query getRoute($from: ID!, $to: ID!) {
    PointOfInterest(node_osm_id: $from) {
      routeToPOI(poi: $to) {
        latitude
        longitude
      }
    }
  }
`

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.poi.PointOfInterest[0]
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  const [getRoute, { loading, data: routeData }] = useLazyQuery(GET_ROUTE_QUERY)

  const [viewport, setViewport] = useState({
    latitude: 40.7812,
    longitude: -73.9665,
    zoom: 13,
  })

  const onRouteSelected = e => {
    // ??
    // query the neo4j graphql API
    // to find optimal route from the current POI to the selected
    getRoute({ variables: { from: post.node_osm_id, to: e.target.value } })
    console.log(routeData)
  }

  let routeGeojson
  if (routeData) {
    routeGeojson = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: routeData.PointOfInterest[0].routeToPOI.map((s, i) => {
          return [s.longitude, s.latitude]
        }),
      },
    }
    console.log(routeGeojson)
  }

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title={post.name} description={post.type} />
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
          <img src={post.photos[0]} alt={`Photo of ${post.name}`} />
          Route to:
          <select name="route" onChange={onRouteSelected}>
            {data.allPOIs.PointOfInterest.map((p, i) => {
              return (
                <option key={i} value={p.node_osm_id}>
                  {p.name}
                </option>
              )
            })}
          </select>
          <MapGL
            style={{ width: "100%", height: "600px" }}
            mapStyle="mapbox://styles/mapbox/light-v9"
            accessToken={process.env.GATSBY_MAPBOX_KEY}
            latitude={viewport.latitude}
            longitude={viewport.longitude}
            zoom={viewport.zoom}
            onViewportChange={setViewport}
          >
            <Marker
              longitude={post.location.longitude}
              latitude={post.location.latitude}
            >
              <svg
                height={20}
                viewBox="0 0 24 24"
                style={{
                  cursor: "pointer",
                  fill: "green",
                  stroke: "none",
                  //transform: `translate(${-10 / 2}px,${-10}px)`,
                }}
              >
                <path
                  d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z"
                />
              </svg>
            </Marker>
            {routeGeojson && (
              <div>
                <Source id="route" type="geojson" data={routeGeojson} />
                <Layer
                  id="route"
                  type="line"
                  source="route"
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                  paint={{
                    "line-color": "blue",
                    "line-width": 8,
                  }}
                />
                <Marker
                  longitude={
                    routeGeojson.geometry.coordinates[
                      routeGeojson.geometry.coordinates.length - 1
                    ][0]
                  }
                  latitude={
                    routeGeojson.geometry.coordinates[
                      routeGeojson.geometry.coordinates.length - 1
                    ][1]
                  }
                >
                  <svg
                    height={20}
                    viewBox="0 0 24 24"
                    style={{
                      cursor: "pointer",
                      fill: "red",
                      stroke: "none",
                      //transform: `translate(${-10 / 2}px,${-10}px)`,
                    }}
                  >
                    <path
                      d="M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z"
                    />
                  </svg>
                </Marker>
              </div>
            )}
          </MapGL>
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
        <p>
          <ul>
            {post.tags?.map((t, i) => {
              return (
                <li key={i}>
                  <strong>{t.key}</strong>: {t.value}
                </li>
              )
            })}
          </ul>
        </p>
        <div dangerouslySetInnerHTML={{ __html: post.wikipedia }} />
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
              <Link to={`/` + previous.node_osm_id} rel="prev">
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
  query POIBySlug($slug: ID!) {
    site {
      siteMetadata {
        title
      }
    }
    allPOIs: poi {
      PointOfInterest(orderBy: name_asc) {
        name
        node_osm_id
      }
    }
    poi {
      PointOfInterest(node_osm_id: $slug) {
        name
        node_osm_id
        photos(first: 1)
        wikipedia
        location {
          latitude
          longitude
        }
        tags {
          key
          value
        }
        type
      }
    }
  }
`
