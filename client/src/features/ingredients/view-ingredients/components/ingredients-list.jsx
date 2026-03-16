import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useIngredients } from '../api/view-ingredient';
import IngredientsGrid from './ingredients-grid';
import IngredientsPagination from './ingredients-pagination';
import IngredientsToolbar from './ingredients-toolbar';

export default function IngredientsList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const name = searchParams.get('name') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const params = useMemo(() => {
    const p = { page, limit: 10 };
    if (name) p.name = name;
    return p;
  }, [page, name]);
  const { data } = useIngredients(params);

  const docs = data?.docs ?? [];

  return (
    <div className='mx-auto w-full max-w-5xl space-y-4'>
      <IngredientsToolbar
        name={name}
        onNameChange={useCallback(
          val => {
            setSearchParams(prev => {
              const next = new URLSearchParams(prev);
              if (val) next.set('name', val);
              else next.delete('name');
              next.set('page', '1');
              return next;
            });
          },
          [setSearchParams]
        )}
        totalDocs={data?.totalDocs ?? 0}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
      />

      <IngredientsGrid items={docs} />

      <IngredientsPagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        hasPrevPage={!!data?.hasPrevPage}
        hasNextPage={!!data?.hasNextPage}
        onPrev={() =>
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(Math.max(1, page - 1)));
            return next;
          })
        }
        onNext={() =>
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(page + 1));
            return next;
          })
        }
      />
    </div>
  );
}
