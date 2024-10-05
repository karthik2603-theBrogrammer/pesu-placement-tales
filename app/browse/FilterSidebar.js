import React from "react";
import { Checkbox, Radio, RadioGroup, Select, SelectItem, Slider } from "@nextui-org/react";

const FilterSidebar = ({ filters, setFilters }) => {
  const handleCheckboxChange = (category, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [category]: {
        ...prevFilters[category],
        [value]: !prevFilters[category]?.[value],
      },
    }));
  };

  const handleRadioChange = (category, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [category]: value,
    }));
  };

  const handleYearChange = (value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      year: value,
    }));
  };

  const handleSliderChange = (category, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [category]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      year: "",
      tier: {},
      jobType: "",
      baseSalary: [0, 90],
      ctc: [0, 90],
      onlyFemales: false,
      internshipStipend: [0, 90],
      shortlistingCriteria: {},
      cgpa: "",
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2022 + 1 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="w-80 bg-white p-6 shadow-lg h-screen overflow-y-auto top-0">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 top-0 bg-white z-10">Filters</h2>

      <FilterSection title="Year">
        <div className="">
          <Select
            label="Select Year"
            placeholder="Choose a year"
            selectedKeys={filters.year ? [filters.year] : []}
            onChange={(e) => handleYearChange(e.target.value)}
          >
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </Select>
        </div>
      </FilterSection>

      <FilterSection title="Tier">
        <div className="flex flex-col space-y-2">
          {["Dream", "1", "2", "3"].map((tier) => (
            <Checkbox
              key={tier}
              size="sm"
              color="primary"
              isSelected={filters.tier?.[tier]}
              onValueChange={() => handleCheckboxChange("tier", tier)}
            >
              {tier === "Dream" ? "Dream" : `Tier ${tier}`}
            </Checkbox>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Job Type">
        <RadioGroup
          value={filters.jobType}
          onValueChange={(value) => handleRadioChange("jobType", value)}
        >
          <Radio value="FTE">FTE</Radio>
          <Radio value="Internship">Internship</Radio>
          <Radio value="FTE+Internship">FTE+Internship</Radio>
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Base Salary (LPA)">
        <Slider
          label="Base Salary Range"
          step={1}
          minValue={0}
          maxValue={90}
          value={filters.baseSalary}
          onChange={(value) => handleSliderChange("baseSalary", value)}
          className="max-w-md"
          color="warning"
        />
        <div className="flex justify-between mt-2">
          <span>{filters.baseSalary[0]} LPA</span>
          <span>{filters.baseSalary[1]} LPA</span>
        </div>
      </FilterSection>

      <FilterSection title="CTC (LPA)">
        <Slider
          label="CTC Range"
          step={1}
          minValue={0}
          maxValue={90}
          value={filters.ctc}
          onChange={(value) => handleSliderChange("ctc", value)}
          className="max-w-md"
          color="warning"
        />
        <div className="flex justify-between mt-2">
          <span>{filters.ctc[0]} LPA</span>
          <span>{filters.ctc[1]} LPA</span>
        </div>
      </FilterSection>

      <FilterSection title="Gender">
        <Checkbox
          size="sm"
          color="primary"
          isSelected={filters.onlyFemales}
          onValueChange={(checked) => setFilters(prev => ({ ...prev, onlyFemales: checked }))}
        >
          Only Females
        </Checkbox>
      </FilterSection>

      <FilterSection title="Internship Stipend (K per month)">
        <Slider
          label="Stipend Range"
          step={1}
          minValue={0}
          maxValue={90}
          value={filters.internshipStipend}
          onChange={(value) => handleSliderChange("internshipStipend", value)}
          className="max-w-md"
          color="warning"
        />
        <div className="flex justify-between mt-2">
          <span>{filters.internshipStipend[0]}K</span>
          <span>{filters.internshipStipend[1]}K</span>
        </div>
      </FilterSection>

      <FilterSection title="Shortlisting Criteria">
        <div className="flex flex-col space-y-2">
          {["CGPA", "Hackathon", "Resume"].map((criteria) => (
            <Checkbox
              key={criteria}
              size="sm"
              color="primary"
              isSelected={filters.shortlistingCriteria?.[criteria]}
              onValueChange={() => handleCheckboxChange("shortlistingCriteria", criteria)}
            >
              {criteria}
            </Checkbox>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="CGPA">
        <RadioGroup
          value={filters.cgpa}
          onValueChange={(value) => handleRadioChange("cgpa", value)}
        >
          {["6.5+", "7+", "8+", "8.5+", "9+", "9.5+"].map((cgpa) => (
            <Radio key={cgpa} value={cgpa}>{cgpa}</Radio>
          ))}
        </RadioGroup>
      </FilterSection>

      <div className="mt-8">
        <button
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          onClick={clearAllFilters}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

const FilterSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
    {children}
  </div>
);

export default FilterSidebar;