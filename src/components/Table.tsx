import { useRef, useState, useEffect } from "react";
import {
  DataTable,
  DataTablePageEvent,
  DataTableSelectionMultipleChangeEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { ProgressSpinner } from "primereact/progressspinner";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function Table() {
  interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: string;
    date_end: string;
  }

  interface Pagination {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
    next_url: string | null;
  }

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectedRows, setSelectedRows] = useState<number>(0);
  const [first, setFirst] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const op = useRef<OverlayPanel>(null);

  const rowsPerPage = 12;

  const fetchArtworks = async (page: number, rowsNeeded: number = 0) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      const data = await response.json();

      const mappedArtworks = data.data.map((artwork: Artwork) => ({
        id: artwork.id,
        title: artwork.title || "Unknown Title",
        place_of_origin: artwork.place_of_origin || "Unknown Place",
        artist_display: artwork.artist_display || "Unknown Artist",
        inscriptions: artwork.inscriptions || "None",
        date_start: artwork.date_start || "Unknown",
        date_end: artwork.date_end || "Unknown",
      }));

      setArtworks((prev) =>
        rowsNeeded > 0 ? [...prev, ...mappedArtworks] : mappedArtworks
      );

      setPagination(data.pagination);

      if (rowsNeeded > rowsPerPage) {
        const nextPage = page + 1;
        const remainingRows = rowsNeeded - rowsPerPage;
        await fetchArtworks(nextPage, remainingRows);
      }
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1);
  }, []);

  const onPageChange = (event: DataTablePageEvent) => {
    const nextPage = Math.ceil(event.first / event.rows) + 1;
    setFirst(event.first);
    fetchArtworks(nextPage);
  };

  const handleSubmit = async () => {
    if (selectedRows) {
      let allFetchedRows: Artwork[] = [];
      const fetchRequiredRows = async (page: number, rowsToFetch: number) => {
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}`
        );
        const data = await response.json();

        const mappedArtworks = data.data.map((artwork: Artwork) => ({
          id: artwork.id,
          title: artwork.title || "Unknown Title",
          place_of_origin: artwork.place_of_origin || "Unknown Place",
          artist_display: artwork.artist_display || "Unknown Artist",
          inscriptions: artwork.inscriptions || "None",
          date_start: artwork.date_start || "Unknown",
          date_end: artwork.date_end || "Unknown",
        }));

        allFetchedRows = [...allFetchedRows, ...mappedArtworks];

        if (rowsToFetch > mappedArtworks.length) {
          const remainingRows = rowsToFetch - mappedArtworks.length;
          await fetchRequiredRows(page + 1, remainingRows);
        }
      };

      await fetchRequiredRows(1, selectedRows);
      setArtworks(allFetchedRows);
      setSelectedArtworks(allFetchedRows.slice(0, selectedRows));
    }
    op.current?.hide();
  };

  return (
    <div className="card p-6 bg-gray-100 shadow-lg rounded-md">
      <h3 className="font-bold text-2xl text-center mb-6 text-gray-700">
        Artworks Table
      </h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={artworks}
          paginator
          rows={rowsPerPage}
          tableStyle={{ minWidth: "50rem" }}
          stripedRows
          selectionMode="multiple"
          selection={selectedArtworks}
          onSelectionChange={(
            e: DataTableSelectionMultipleChangeEvent<Artwork[]>
          ) => setSelectedArtworks(e.value as Artwork[])}
          dataKey="id"
          totalRecords={pagination?.total || 0}
          lazy
          first={first}
          onPage={onPageChange}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>

          <Column
            field="title"
            header={
              <div className="flex items-center justify-between">
                <i
                  className="pi pi-chevron-down cursor-pointer text-gray-600 hover:text-blue-600 mr-4"
                  onClick={(e) => op.current?.toggle(e)}
                ></i>
                <span className="text-gray-800 font-semibold">Title</span>
                <OverlayPanel ref={op}>
                  <div className="flex flex-col gap-3">
                    <input
                      type="number"
                      placeholder="Select Rows..."
                      className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onChange={(e) => setSelectedRows(Number(e.target.value))}
                      min={1}
                      max={pagination?.total || rowsPerPage}
                    />
                    <div className="flex justify-end">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </OverlayPanel>
              </div>
            }
          ></Column>

          <Column field="place_of_origin" header="Place of Origin"></Column>
          <Column field="artist_display" header="Artist"></Column>
          <Column field="inscriptions" header="Inscriptions"></Column>
          <Column field="date_start" header="Start Date"></Column>
          <Column field="date_end" header="End Date"></Column>
        </DataTable>
      )}
    </div>
  );
}
